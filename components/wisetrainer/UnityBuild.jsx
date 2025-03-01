// components/wisetrainer/UnityBuild.jsx
"use client";

import React, {
	useState,
	useEffect,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";

const UnityBuild = forwardRef(({ courseId, onQuestionnaireRequest }, ref) => {
	const { containerName } = useAzureContainer();
	const [loadingTimeout, setLoadingTimeout] = useState(false);

	// Debug logs pour voir les valeurs
	console.log("Building UnityBuild for courseId:", courseId);
	console.log("containerName:", containerName);

	const {
		unityProvider,
		loadingProgression,
		isLoaded,
		requestFullscreen,
		takeScreenshot,
		unload,
		addEventListener,
		removeEventListener,
		sendMessage,
	} = useUnityContext({
		loaderUrl: `/api/azure/fetch-blob-data/${containerName}/${courseId}.loader.js?subfolder=wisetrainer`,
		dataUrl: `/api/azure/fetch-blob-data/${containerName}/${courseId}.data.gz?subfolder=wisetrainer`,
		frameworkUrl: `/api/azure/fetch-blob-data/${containerName}/${courseId}.framework.js.gz?subfolder=wisetrainer`,
		codeUrl: `/api/azure/fetch-blob-data/${containerName}/${courseId}.wasm.gz?subfolder=wisetrainer`,
	});

	// Expose methods to parent component through ref
	useImperativeHandle(ref, () => ({
		completeQuestionnaire: (scenarioId, success) => {
			if (isLoaded) {
				sendMessage(
					"GameManager",
					"OnQuestionnaireCompleted",
					JSON.stringify({ scenarioId, success })
				);
			}
		},
		isReady: isLoaded,
	}));

	// Handle Unity event for questionnaire requests
	const handleQuestionnaireRequest = useCallback(
		(event) => {
			const scenarioId = event.detail;
			console.log("Questionnaire requested for scenario:", scenarioId);

			// Fetch the scenario data from the API
			axios
				.get(`/api/db/wisetrainer/scenario/${scenarioId}`)
				.then((response) => {
					if (onQuestionnaireRequest) {
						onQuestionnaireRequest(response.data);
					}
				})
				.catch((error) => {
					console.error("Error fetching scenario:", error);
				});
		},
		[onQuestionnaireRequest]
	);

	// Add event listeners when Unity is loaded
	useEffect(() => {
		if (isLoaded) {
			addEventListener(
				"QuestionnaireRequest",
				handleQuestionnaireRequest
			);
			addEventListener("GameObjectSelected", handleGameObjectSelected);
		}

		return () => {
			if (isLoaded) {
				removeEventListener(
					"QuestionnaireRequest",
					handleQuestionnaireRequest
				);
				removeEventListener(
					"GameObjectSelected",
					handleGameObjectSelected
				);
			}
		};
	}, [
		isLoaded,
		addEventListener,
		removeEventListener,
		handleQuestionnaireRequest,
		handleGameObjectSelected,
	]);

	// Loading timeout detection
	useEffect(() => {
		if (!isLoaded && !loadingTimeout) {
			const timer = setTimeout(() => {
				setLoadingTimeout(true);
			}, 60000); // 60 seconds timeout

			return () => clearTimeout(timer);
		}
	}, [isLoaded, loadingTimeout]);

	// Cleanup Unity on unmount
	useEffect(() => {
		return () => {
			if (isLoaded && unload) {
				unload();
			}
		};
	}, [isLoaded, unload]);

	return (
		<Card className="overflow-hidden">
			<CardContent className="p-0">
				<div className="aspect-video w-full relative">
					{/* Loading state */}
					{!isLoaded && (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800">
							{loadingTimeout ? (
								<div className="text-center p-4">
									<p className="text-red-500 mb-4">
										The training module is taking too long
										to load.
									</p>
									<Button
										onClick={() => window.location.reload()}
									>
										Try Again
									</Button>
									<p className="mt-4 text-sm text-gray-500">
										You can also try going back to the
										course list and selecting this course
										again.
									</p>
								</div>
							) : (
								<>
									<div className="mb-4">
										Loading training environment...
									</div>
									<div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-wisetwin-blue h-2.5 rounded-full"
											style={{
												width: `${Math.round(
													loadingProgression * 100
												)}%`,
											}}
										></div>
									</div>
									<div className="mt-2 text-sm text-gray-500">
										{Math.round(loadingProgression * 100)}%
									</div>
								</>
							)}
						</div>
					)}

					{/* Unity container */}
					<Unity
						unityProvider={unityProvider}
						style={{ width: "100%", height: "100%" }}
						className={isLoaded ? "block" : "hidden"}
					/>
				</div>
			</CardContent>
			<CardFooter className="bg-gray-50 dark:bg-gray-900 p-4">
				<div className="flex flex-wrap gap-2 w-full justify-center">
					<Button
						variant="outline"
						size="sm"
						onClick={() => requestFullscreen(true)}
						disabled={!isLoaded}
					>
						Fullscreen
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							if (isLoaded) {
								const screenshot = takeScreenshot("image/png");
								if (screenshot) {
									const url = URL.createObjectURL(screenshot);
									window.open(url, "_blank");
								}
							}
						}}
						disabled={!isLoaded}
					>
						Take Screenshot
					</Button>
				</div>
			</CardFooter>
		</Card>
	);
});

UnityBuild.displayName = "UnityBuild";

export default UnityBuild;
