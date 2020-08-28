import * as path from 'path';
import * as vscode from 'vscode';
import { getNonce } from './util';

/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class CantataInteractableEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable { 
		const provider = new CantataInteractableEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(CantataInteractableEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'cantata-tools.interactable';

	// private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview,document);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
                // case 'validate':
                //     this.validateInteractable(document);
                //     return;
                case 'testsvelte':
                    
                    vscode.window.showInformationMessage("recieved message from svelte component");
                    return;
                case 'updateDocumentFromInput':
					// var json = this.getDocumentAsJson(document);
					// json[e.update.key] = e.update.value;
					this.updateTextDocument(document, e.update);
                    return;
			}
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
		// Local path to script and css for the webview
		// const scriptUri = webview.asWebviewUri(vscode.Uri.file(
		// 	path.join(this.context.extensionPath, 'media', 'catScratch.js')
		// ));
		// const styleUri = webview.asWebviewUri(vscode.Uri.file(
		// 	path.join(this.context.extensionPath, 'media', 'catScratch.css')
        // ));
        
		const scriptUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this.context.extensionPath, 'out', 'compiled/bundle.js')
		));
		const interactableDataUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this.context.extensionPath, 'includes', 'interactableData.js')
		));
		const styleUri = webview.asWebviewUri(vscode.Uri.file(
			path.join(this.context.extensionPath, 'out', 'compiled/bundle.css')
			// path.join(this.context.extensionPath, 'includes', 'bulma.css')
		));

        // const json = this.getDocumentAsJson(document);
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		// return /* html */`
		// 	<!DOCTYPE html>
		// 	<html lang="en">
		// 	<head>
		// 		<meta charset="UTF-8">

		// 		<!--
		// 		Use a content security policy to only allow loading images from https or from our extension directory,
		// 		and only allow scripts that have a specific nonce.
		// 		-->
		// 		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

		// 		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		// 		<link href="${styleUri}" rel="stylesheet" />

		// 		<title>Cat Scratch</title>
		// 	</head>
		// 	<body>
		// 		<div class="notes">
		// 			<div class="add-button">
		// 				<button>Scratch!</button>
		// 			</div>
		// 		</div>
				
		// 		<script nonce="${nonce}" src="${scriptUri}"></script>
		// 	</body>
        // 	</html>`;
        

		// return /* html */`
		// 	<!DOCTYPE html>
		// 	<html lang="en">
		// 	<head>
		// 		<meta charset="UTF-8">

		// 		<!--
		// 		Use a content security policy to only allow loading images from https or from our extension directory,
		// 		and only allow scripts that have a specific nonce.
		// 		-->
		// 		<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

		// 		<meta name="viewport" content="width=device-width, initial-scale=1.0">

		// 		<link href="${styleUri}" rel="stylesheet" />

		// 		<title>Cantata Interactable</title>
		// 	</head>
        //     <body>
        //         <h1>Testing Interactable</h1>
        //         <h1>${json.name}</h1>
		// 	</body>
		// 	</html>`;
        
        
        return /* html */`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset='utf-8'>
            <meta name='viewport' content='width=device-width,initial-scale=1'>
            <title>Cantata Data Editor</title>
        
            <!--- <link rel='icon' type='image/png' href='/favicon.png'> -->
            <!--- <link rel='stylesheet' href='/global.css'> -->
            <link rel='stylesheet' href="${styleUri}">
			<script src="${interactableDataUri}"></script>
            <script defer src="${scriptUri}"></script>
		</head>
			
		<body>
		<script>
			const vscode = acquireVsCodeApi();
			window.onload = function() {
				vscode.postMessage({ command: 'get-data' });
				console.log('Ready to accept data.');
			};
		</script>
        </body>
        </html>`;
	}

	/**
	 * Add a new scratch to the current document.
	 */
	// private addNewScratch(document: vscode.TextDocument) {
	// 	const json = this.getDocumentAsJson(document);
	// 	const character = CantataInteractableEditorProvider.scratchCharacters[Math.floor(Math.random() * CantataInteractableEditorProvider.scratchCharacters.length)];
	// 	json.scratches = [
	// 		...(Array.isArray(json.scratches) ? json.scratches : []),
	// 		{
	// 			id: getNonce(),
	// 			text: character,
	// 			created: Date.now(),
	// 		}
	// 	];

	// 	return this.updateTextDocument(document, json);
	// }

	/**
	 * Delete an existing scratch from a document.
	 */
	// private deleteScratch(document: vscode.TextDocument, id: string) {
	// 	const json = this.getDocumentAsJson(document);
	// 	if (!Array.isArray(json.scratches)) {
	// 		return;
	// 	}

	// 	json.scratches = json.scratches.filter((note: any) => note.id !== id);

	// 	return this.updateTextDocument(document, json);
    // }
    
    private validateInteractable(document: vscode.TextDocument) {
        const json = this.getDocumentAsJson(document);
        //TODO: run validation code
		// const character = CantataInteractableEditorProvider.scratchCharacters[Math.floor(Math.random() * CantataInteractableEditorProvider.scratchCharacters.length)];
		// json.scratches = [
		// 	...(Array.isArray(json.scratches) ? json.scratches : []),
		// 	{
		// 		id: getNonce(),
		// 		text: character,
		// 		created: Date.now(),
		// 	}
		// ];

        // return this.updateTextDocument(document, json);
        return true;
    }

	/**
	 * Try to get a current document as json text.
	 */
	private getDocumentAsJson(document: vscode.TextDocument): any {
		const text = document.getText();
		if (text.trim().length === 0) {
			return {};
		}

		try {
			return JSON.parse(text);
		} catch {
			throw new Error('Could not get document as json. Content is not valid json');
		}
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));
		
		return vscode.workspace.applyEdit(edit);
	}
}
