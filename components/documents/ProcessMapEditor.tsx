import React, {
  useState,
  useEffect,
  useRef,
  FC,
  MouseEvent as ReactMouseEvent,
  WheelEvent as ReactWheelEvent,
} from "react";
import {
  AppDocument,
  ProcessNode,
  ProcessEdge,
  Project,
  ChecklistItem,
  CAPAReport,
} from "../../types";
import { useTranslation } from "../../hooks/useTranslation";
// FIX: Import the correct and newly added icons for the process map editor.
import {
  TrashIcon,
  ShareIcon,
  PlayIcon,
  CogIcon,
  XMarkIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  StopCircleIcon,
  DiamondIcon,
} from "../icons";
import { useProjectStore } from "../../stores/useProjectStore";

interface ProcessMapEditorProps {
  isOpen: boolean;
  onClose: () => void;
  document: AppDocument;
  onSave: (document: AppDocument) => void;
}

const ProcessNodeDetailPanel: FC<{
  document: AppDocument;
  projects: Project[];
}> = ({ document, projects }) => {
  const { t } = useTranslation();

  const linkedItems = React.useMemo(() => {
    const checklistItems: (ChecklistItem & { projectName: string })[] = [];
    const capaReports: (CAPAReport & { projectName: string })[] = [];

    for (const project of projects) {
      for (const item of project.checklist) {
        // A process node is represented by a document. We find items where this document is evidence.
        if (item.evidenceFiles.includes(document.id)) {
          checklistItems.push({ ...item, projectName: project.name });
          const capas = project.capaReports.filter(
            (c) => c.sourceChecklistItemId === item.id
          );
          capaReports.push(
            ...capas.map((c) => ({ ...c, projectName: project.name }))
          );
        }
      }
    }
    return { checklistItems, capaReports };
  }, [document.id, projects]);

  return (
    <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border dark:border-dark-brand-border rounded-lg shadow-lg w-80 max-h-[calc(100%-2rem)] flex flex-col pointer-events-auto animate-[fadeIn_0.3s_ease-out]">
      <h4 className="text-sm font-semibold p-3 border-b dark:border-dark-brand-border">
        {t("linkedItems")}
      </h4>
      <div className="p-3 overflow-y-auto space-y-4">
        <div>
          <h5 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
            <FolderIcon className="w-4 h-4" />
            {t("linkedChecklistItems")}
          </h5>
          {linkedItems.checklistItems.length > 0 ? (
            <ul className="space-y-2">
              {linkedItems.checklistItems.map((item) => (
                <li
                  key={item.id}
                  className="text-xs p-2 bg-slate-100 dark:bg-slate-900/50 rounded-md"
                >
                  <strong className="text-brand-primary">
                    {item.standardId}
                  </strong>{" "}
                  in {item.projectName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-center text-gray-400 py-2">
              {t("noLinkedItems")}
            </p>
          )}
        </div>
        <div>
          <h5 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-1.5">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {t("linkedCapaReports")}
          </h5>
          {linkedItems.capaReports.length > 0 ? (
            <ul className="space-y-2">
              {linkedItems.capaReports.map((capa) => (
                <li
                  key={capa.id}
                  className="text-xs p-2 bg-red-50 dark:bg-red-900/20 rounded-md"
                >
                  <strong className="text-red-500">{capa.id}</strong> from{" "}
                  {capa.projectName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-center text-gray-400 py-2">
              {t("noLinkedItems")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ProcessMapEditor: FC<ProcessMapEditorProps> = ({
  isOpen,
  onClose,
  document,
  onSave,
}) => {
  const { t, lang } = useTranslation();
  const projects = useProjectStore((state) => state.projects);
  const [nodes, setNodes] = useState<ProcessNode[]>([]);
  const [edges, setEdges] = useState<ProcessEdge[]>([]);
  const [selectedElement, setSelectedElement] = useState<{
    type: "node" | "edge";
    id: string;
  } | null>(null);
  const [connecting, setConnecting] = useState<{
    from: string;
    to: { x: number; y: number };
  } | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<ProcessNode | null>(null);

  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (document.processMapContent) {
      setNodes(document.processMapContent.nodes);
      setEdges(document.processMapContent.edges);
    }
  }, [document]);

  const getSVGPoint = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const svgP = pt.matrixTransform(ctm.inverse());
    return {
      x: (svgP.x - viewTransform.x) / viewTransform.scale,
      y: (svgP.y - viewTransform.y) / viewTransform.scale,
    };
  };

  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setSelectedElement(null);
      setDetailNode(null);
    }
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setViewTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
    if (connecting) {
      const { x, y } = getSVGPoint(e.clientX, e.clientY);
      setConnecting((prev) => (prev ? { ...prev, to: { x, y } } : null));
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: ReactWheelEvent<HTMLElement>) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.max(
      0.2,
      Math.min(2, viewTransform.scale + scaleAmount)
    );
    setViewTransform((prev) => ({ ...prev, scale: newScale }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElement) {
        if (selectedElement.type === "node") {
          setNodes((prev) => prev.filter((n) => n.id !== selectedElement.id));
          setEdges((prev) =>
            prev.filter(
              (edge) =>
                edge.source !== selectedElement.id &&
                edge.target !== selectedElement.id
            )
          );
        } else {
          setEdges((prev) =>
            prev.filter((edge) => edge.id !== selectedElement.id)
          );
        }
        setSelectedElement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElement]);

  const addNode = (type: ProcessNode["type"]) => {
    const { x, y } = getSVGPoint(window.innerWidth / 2, window.innerHeight / 2);
    const newNode: ProcessNode = {
      id: `${type}-${Date.now()}`,
      type,
      text: `New ${type}`,
      position: { x, y },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleNodeDrag = (id: string, dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
          : n
      )
    );
  };

  const handleNodeClick = (node: ProcessNode) => {
    if (connecting?.from && connecting.from !== node.id) {
      setEdges((prev) => [
        ...prev,
        {
          id: `e-${connecting.from}-${node.id}`,
          source: connecting.from,
          target: node.id,
        },
      ]);
      setConnecting(null);
    } else {
      setSelectedElement({ type: "node", id: node.id });
      if (node.type === "process") {
        setDetailNode(node);
      } else {
        setDetailNode(null);
      }
    }
  };

  const updateNodeText = (id: string, text: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  };

  const handleSave = () =>
    onSave({ ...document, processMapContent: { nodes, edges } });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm modal-enter"
      onClick={onClose}
    >
      <div className="bg-white dark:bg-dark-brand-surface rounded-lg shadow-xl w-full max-w-7xl h-[90vh] m-4 flex flex-col modal-content-enter">
        <header className="p-4 border-b dark:border-dark-brand-border flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-semibold">{document.name[lang]}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm mr-2"
            >
              {t("save")}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 rounded-full dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <div className="flex flex-grow overflow-hidden">
          <aside className="w-56 bg-gray-50 dark:bg-gray-900/50 p-4 border-r dark:border-dark-brand-border space-y-4">
            <h4 className="font-semibold">{t("nodes")}</h4>
            <div className="space-y-2">
              <button
                onClick={() => addNode("start")}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                <PlayIcon className="w-5 h-5 text-green-500" />
                {t("startNode")}
              </button>
              <button
                onClick={() => addNode("process")}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                <CogIcon className="w-5 h-5 text-blue-500" />
                {t("processNode")}
              </button>
              <button
                onClick={() => addNode("decision")}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                <DiamondIcon className="w-5 h-5 text-yellow-500" />
                {t("decisionNode")}
              </button>
              <button
                onClick={() => addNode("end")}
                className="w-full flex items-center gap-2 p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-sm"
              >
                <StopCircleIcon className="w-5 h-5 text-red-500" />
                {t("endNode")}
              </button>
            </div>
            {selectedElement?.type === "node" && (
              <div className="border-t pt-4 space-y-2">
                <button
                  onClick={() =>
                    setConnecting({
                      from: selectedElement.id,
                      to: { x: 0, y: 0 },
                    })
                  }
                  className="w-full flex items-center gap-2 text-sm bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={!!connecting}
                >
                  <ShareIcon className="w-4 h-4" />
                  {t("connect")}
                </button>
              </div>
            )}
          </aside>
          <main
            className="flex-grow relative dot-grid cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg ref={svgRef} className="w-full h-full pointer-events-none">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 -5 10 10"
                  refX="8"
                  refY="0"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto"
                >
                  <path d="M0,-5L10,0L0,5" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrowSelected"
                  viewBox="0 -5 10 10"
                  refX="8"
                  refY="0"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto"
                >
                  <path d="M0,-5L10,0L0,5" fill="#3b82f6" />
                </marker>
              </defs>
              <g
                transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale})`}
              >
                {edges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  const { width: sw, height: sh } = getNodeDimensions(
                    sourceNode.type
                  );
                  const { width: tw, height: th } = getNodeDimensions(
                    targetNode.type
                  );
                  return (
                    <line
                      key={edge.id}
                      x1={sourceNode.position.x + sw / 2}
                      y1={sourceNode.position.y + sh / 2}
                      x2={targetNode.position.x + tw / 2}
                      y2={targetNode.position.y + th / 2}
                      stroke={
                        selectedElement?.id === edge.id ? "#3b82f6" : "#94a3b8"
                      }
                      strokeWidth="2.5"
                      markerEnd={
                        selectedElement?.id === edge.id
                          ? "url(#arrowSelected)"
                          : "url(#arrow)"
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement({ type: "edge", id: edge.id });
                        setDetailNode(null);
                      }}
                      className="cursor-pointer pointer-events-auto"
                    />
                  );
                })}
                {connecting && nodes.find((n) => n.id === connecting.from) && (
                  <line
                    x1={
                      nodes.find((n) => n.id === connecting.from)!.position.x +
                      60
                    }
                    y1={
                      nodes.find((n) => n.id === connecting.from)!.position.y +
                      40
                    }
                    x2={connecting.to.x}
                    y2={connecting.to.y}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                )}
              </g>
            </svg>
            <div
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
                transformOrigin: "0 0",
              }}
            >
              {nodes.map((node) => (
                <Node
                  key={node.id}
                  node={node}
                  onDrag={handleNodeDrag}
                  scale={viewTransform.scale}
                  isSelected={selectedElement?.id === node.id}
                  onClick={() => handleNodeClick(node)}
                  onDoubleClick={() => setEditingNodeId(node.id)}
                  isEditing={editingNodeId === node.id}
                  onTextChange={(text) => updateNodeText(node.id, text)}
                  onTextBlur={() => setEditingNodeId(null)}
                />
              ))}
            </div>
            {detailNode && (
              <ProcessNodeDetailPanel document={document} projects={projects} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const Node: FC<{
  node: ProcessNode;
  onDrag: (id: string, dx: number, dy: number) => void;
  scale: number;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  isEditing: boolean;
  onTextChange: (text: string) => void;
  onTextBlur: () => void;
}> = ({
  node,
  onDrag,
  scale,
  isSelected,
  onClick,
  onDoubleClick,
  isEditing,
  onTextChange,
  onTextBlur,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.stopPropagation();
    onClick();
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDragging) return;
      const dx = (e.clientX - lastMousePos.current.x) / scale;
      const dy = (e.clientY - lastMousePos.current.y) / scale;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      onDrag(node.id, dx, dy);
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, node.id, onDrag, scale]);

  const { width, height } = getNodeDimensions(node.type);

  const Icon = {
    start: PlayIcon,
    process: CogIcon,
    decision: DiamondIcon,
    end: StopCircleIcon,
  }[node.type];
  const colors = {
    start: {
      bg: "from-green-400 to-green-600",
      text: "text-white",
      border: "border-green-700",
    },
    process: {
      bg: "from-blue-400 to-blue-600",
      text: "text-white",
      border: "border-blue-700",
    },
    decision: {
      bg: "from-amber-400 to-amber-600",
      text: "text-amber-900",
      border: "border-amber-700",
    },
    end: {
      bg: "from-red-400 to-red-600",
      text: "text-white",
      border: "border-red-700",
    },
  };
  const color = colors[node.type];

  const baseStyle = `absolute cursor-pointer flex flex-col items-center justify-center p-2 border-2 transition-all text-center text-sm font-semibold select-none shadow-lg hover:shadow-xl bg-gradient-to-br ${color.bg} ${color.text} ${color.border} pointer-events-auto`;
  const selectedStyle = isSelected
    ? "ring-4 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800"
    : "";
  const shapeStyle = {
    start: "rounded-full",
    process: "rounded-md",
    decision: "",
    end: "rounded-full",
  }[node.type];

  const clipPaths = {
    decision: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  };

  return (
    <div
      style={{
        left: node.position.x,
        top: node.position.y,
        width,
        height,
        clipPath: node.type === "decision" ? clipPaths.decision : "none",
      }}
      className={`${baseStyle} ${shapeStyle} ${selectedStyle}`}
      onMouseDown={handleMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div
        className={`w-full h-full flex flex-col items-center justify-center`}
      >
        {isEditing ? (
          <textarea
            value={node.text}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={onTextBlur}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" && !e.shiftKey) onTextBlur();
            }}
            autoFocus
            className={`w-full h-full bg-transparent text-center resize-none focus:outline-none p-1 ${color.text}`}
          />
        ) : (
          <>
            <Icon className="w-6 h-6 mb-1 opacity-80 flex-shrink-0" />
            <span className="leading-tight">{node.text}</span>
          </>
        )}
      </div>
    </div>
  );
};

const getNodeDimensions = (type: ProcessNode["type"]) => {
  const dims = { width: 140, height: 90 };
  if (type === "start" || type === "end") {
    dims.width = 100;
    dims.height = 100;
  }
  if (type === "decision") {
    dims.width = 150;
    dims.height = 110;
  }
  return dims;
};

export default ProcessMapEditor;
