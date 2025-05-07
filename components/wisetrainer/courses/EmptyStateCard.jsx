// components/wisetrainer/courses/EmptyStateCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * A reusable empty state component that shows a message and optional action button
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {Function} [props.actionFn] - Optional function to call when button is clicked
 * @param {string} [props.actionText] - Button text (required if actionFn is provided)
 * @param {string} [props.className] - Additional CSS classes
 */
const EmptyStateCard = ({
  icon,
  title,
  description,
  actionFn,
  actionText,
  className = "",
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full">
            {icon}
          </div>
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
        {actionFn && actionText && (
          <Button
            className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
            onClick={actionFn}
          >
            {actionText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;