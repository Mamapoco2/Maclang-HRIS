import React from "react";
import { Sparkles, Zap, Shield, Bug, X } from "lucide-react";

export default function WhatsNew() {
  const [expandedVersion, setExpandedVersion] = React.useState("4.3.0");

  const versions = [
    {
      id: "4.3.0",
      date: "Apr 2, 2025",
      title: "Version 4.3.0",
      tags: [
        { label: "New Features", color: "purple" },
        { label: "Improvements", color: "blue" },
      ],
      newFeatures: [
        "Introduced an AI-powered search bar with semantic query understanding.",
        "Added real-time collaboration — multiple users can now edit dashboards simultaneously.",
        "New chart types: Waterfall, Funnel, and Sankey diagrams.",
      ],
      improvements: [
        "Redesigned the onboarding flow with interactive step-by-step guidance.",
        "Dashboard loading time reduced by 40% through lazy rendering.",
      ],
    },
    {
      id: "4.2.92",
      date: "Mar 22, 2025",
      title: "Version 4.2.92",
      tags: [
        { label: "Improvements", color: "blue" },
        { label: "Security", color: "green" },
        { label: "Bug Fixes", color: "red" },
      ],
      improvements: [
        "Improved tooltip UI and keyboard navigation in settings panels.",
        "New bulk-action toolbar in the user management table.",
      ],
      bugFixes: [],
    },
  ];

  const getTagColors = (color) => {
    switch (color) {
      case "purple":
        return "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-300 icon-purple";
      case "blue":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 icon-blue";
      case "green":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 icon-green";
      case "red":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 icon-red";
      default:
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300";
    }
  };

  const getIcon = (label) => {
    switch (label) {
      case "New Features":
        return <Sparkles className="w-4 h-4" />;
      case "Improvements":
        return <Zap className="w-4 h-4" />;
      case "Security":
        return <Shield className="w-4 h-4" />;
      case "Bug Fixes":
        return <Bug className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black ">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-800">
          <div className="w-2 h-2 rounded-full bg-gray-800 dark:bg-gray-200"></div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Always up to date
          </span>
        </div>
        <h1 className="text-6xl font-bold text-black dark:text-white mb-4 tracking-tight">
          What's new?
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          The latest features, improvements, and fixes — shipped regularly.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full mb-12 border-t border-gray-200 dark:border-gray-800"></div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-20 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800"></div>

          {/* Versions */}
          <div className="space-y-12">
            {versions.map((version) => (
              <div key={version.id} className="relative">
                {/* Timeline dot */}
                <div className="absolute left-12 top-3 w-16 flex justify-center">
                  {expandedVersion === version.id ? (
                    <div className="w-4 h-4 rounded-full bg-black dark:bg-white ring-4 ring-white dark:ring-black"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-white dark:bg-black ring-2 ring-gray-300 dark:ring-gray-700"></div>
                  )}
                </div>

                {/* Content */}
                <div className="ml-40">
                  {/* Date */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {version.date}
                  </p>

                  {/* Version title button */}
                  <button
                    onClick={() =>
                      setExpandedVersion(
                        expandedVersion === version.id ? null : version.id,
                      )
                    }
                    className="text-left mb-3"
                  >
                    <h2 className="text-lg font-bold text-black dark:text-white hover:opacity-70 transition">
                      {version.title}
                    </h2>
                  </button>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {version.tags.map((tag, idx) => (
                      <div
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getTagColors(
                          tag.color,
                        )}`}
                      >
                        {getIcon(tag.label)}
                        <span className="text-sm font-medium">{tag.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expandable content */}
                  {expandedVersion === version.id && (
                    <div className="space-y-6 mt-6">
                      {/* New Features */}
                      {version.newFeatures &&
                        version.newFeatures.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              <h3 className="font-semibold text-black dark:text-white">
                                New Features
                              </h3>
                            </div>
                            <ul className="space-y-2 ml-6">
                              {version.newFeatures.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                                >
                                  <span className="text-gray-400 dark:text-gray-600 mr-2">
                                    •
                                  </span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {/* Improvements */}
                      {version.improvements &&
                        version.improvements.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <h3 className="font-semibold text-black dark:text-white">
                                Improvements
                              </h3>
                            </div>
                            <ul className="space-y-2 ml-6">
                              {version.improvements.map((improvement, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
                                >
                                  <span className="text-gray-400 dark:text-gray-600 mr-2">
                                    •
                                  </span>
                                  {improvement}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhatsNewModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <WhatsNew /> {/* ← must match the function name above exactly */}
      </div>
    </div>
  );
}
