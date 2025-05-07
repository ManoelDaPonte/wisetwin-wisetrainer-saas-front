//components/guide/WiseTwinRecommendations.jsx
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import TrainingCard from "./TrainingCard";

// Ce composant n'est plus utilisé suite à la suppression du catalogue WiseTwin
export default function WiseTwinRecommendations({ trainings }) {
	// Cette fonction est conservée pour compatibilité mais elle n'est plus appelée
	return null;
}
