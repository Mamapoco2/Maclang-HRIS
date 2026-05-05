import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  Users,
  Target,
  MessageCircle,
  BarChart2,
  Heart,
  Award,
} from "lucide-react";

const GUIDE_ITEMS = [
  {
    icon: <MessageCircle className="w-5 h-5" />,
    title: "Hold Regular 1-on-1 Check-ins",
    color: "text-sky-600 bg-sky-50",
    points: [
      "Schedule monthly check-ins focused on development, not just performance",
      "Use open-ended questions: 'What challenges have you faced this week?'",
      "Acknowledge efforts and celebrate progress on skill development",
    ],
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Co-Create Individual Development Plans (IDP)",
    color: "text-violet-600 bg-violet-50",
    points: [
      "Set SMART goals aligned with identified skill gaps",
      "Review and update IDP quarterly",
      "Link development goals to department objectives and service delivery",
    ],
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Facilitate Peer Learning & Mentorship",
    color: "text-teal-600 bg-teal-50",
    points: [
      "Pair struggling staff with experienced mentors or clinical preceptors",
      "Encourage inter-departmental job shadowing",
      "Create communities of practice for sharing best practices",
    ],
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Track Progress & Provide Feedback",
    color: "text-amber-600 bg-amber-50",
    points: [
      "Monitor training completion rates and follow up consistently",
      "Provide constructive, timely feedback after observed procedures or interactions",
      "Use the 'SBI' model: Situation–Behavior–Impact when giving feedback",
    ],
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Foster Psychological Safety",
    color: "text-rose-600 bg-rose-50",
    points: [
      "Create an environment where employees feel safe to admit gaps",
      "Avoid punitive reactions to honest self-assessments",
      "Recognize that admitting a gap is the first step to improvement",
    ],
  },
  {
    icon: <Award className="w-5 h-5" />,
    title: "Recognize & Reward Growth",
    color: "text-emerald-600 bg-emerald-50",
    points: [
      "Acknowledge skill improvements during team meetings or bulletin boards",
      "Nominate high performers for awards (e.g., CSC PRAISE System)",
      "Recommend staff for advanced trainings, scholarships, or leadership programs",
    ],
  },
];

export default function ManagerGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-gray-900">
          Manager's Support Guide
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Practical strategies for supervisors to support employee skill
          development
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {GUIDE_ITEMS.map((item) => (
          <Card key={item.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${item.color}`}>
                  {item.icon}
                </div>
                <CardTitle className="text-base leading-snug">
                  {item.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {item.points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-gray-300 shrink-0 mt-0.5">›</span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-sky-50 to-teal-50 border-sky-200">
        <CardContent className="py-5">
          <p className="font-semibold text-sky-800 mb-1">
            📋 Integration with HR Systems
          </p>
          <p className="text-sky-700 text-sm">
            Skill gap results should be attached to the employee's 201 file and
            referenced during SPMS (Strategic Performance Management System)
            evaluation cycles. Coordinate with HR for LCAT (Learning & Career
            Advancement Training) endorsements as needed.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
