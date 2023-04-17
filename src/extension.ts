// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { spawn } from "child_process";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "railsroutesautocomplete" is now active!');

	// use workspace to listen to changes to routes file - Thomas
	// let railsCommand = vscode.workspace.getConfiguration().get("railsRoutes");
	let workspaceFolder = vscode.workspace.workspaceFolders;

	if(!workspaceFolder) {
		console.log("Couldn't find workspace");
		return;
	}

	let process = spawn('rails', ['c'], {
		cwd: workspaceFolder[0].uri.fsPath
	});
	process.stdin.write("Rails.application.routes.named_routes.helper_names\n");
	
	// let outputChannel = vscode.window.createOutputChannel('rails routes');
	let output: any = [];
	let helperMethods: any |undefined;
	let provider: any;
	
	process.stdout.on('data', (data) => {
		// console.log(typeof data);
		output.push(data.toString().replace(/['"\s\[\]]+/g, ''));
		// outputChannel.appendLine(data);
		// console.log(output[2]);
  });
	
	process.stdin.write("exit\n");

	process.stdout.on('close', () => {
		helperMethods = output[2];
		// console.log(helperMethods);
		provider = vscode.languages.registerCompletionItemProvider("ruby", {
			provideCompletionItems() {
				const completionItems: vscode.CompletionItem[] = [];
				// const helper_methods = outputChannel.split or whatever; //find the part of output that matters
				// const helperMethods = output[-1];
				for (const method of helperMethods?.split(",")) {
					console.log(method);
					const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
					item.insertText = method;
					completionItems.push(item);
				}
				return completionItems;
			}
		});
	});
	// outputChannel.show();
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('railsroutesautocomplete.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from rails-routes-autocomplete!');
	});

	context.subscriptions.push(provider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
