"use client";
import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";

export default function App() {
	const { unityProvider } = useUnityContext({
		// loaderUrl:
		// 	"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.loader.js",
		// dataUrl:
		// 	"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.data.gz",
		// frameworkUrl:
		// 	"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.framework.js.gz",
		// codeUrl:
		// 	"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.wasm.gz",

		loaderUrl:
			"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.loader.js",
		dataUrl:
			"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.data.gz",
		frameworkUrl:
			"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.framework.js.gz",
		codeUrl:
			"api/azure/fetch-blob-data/user-67238d7b7ee4282829948e2c/wisetrainer/wisetrainer-template.wasm.gz",
	});

	return <Unity unityProvider={unityProvider} />;
}
