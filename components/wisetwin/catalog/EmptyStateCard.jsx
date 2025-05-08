// components/wisetwin/catalog/EmptyStateCard.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

/**
 * A reusable empty state component for WiseTwin UI
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} props.description - Description text
 * @param {string} [props.infoText] - Optional info text displayed in a highlighted box
 * @param {Function} [props.actionFn] - Optional function to call when button is clicked
 * @param {string} [props.actionText] - Button text (required if actionFn is provided)
 * @param {string} [props.className] - Additional CSS classes
 */
const EmptyStateCard = ({
  icon,
  title,
  description,
  infoText,
  actionFn,
  actionText,
  className = "",
}) => {
  return (
    <Card className={`w-full border-gray-200 dark:border-gray-700 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {description}
        </p>
        
        {infoText && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 max-w-md">
            <p className="text-wisetwin-blue dark:text-wisetwin-blue-light font-medium">
              {infoText}
            </p>
          </div>
        )}
        
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