import * as vscode from 'vscode';
import { exec } from "child_process";

export function activate(context: vscode.ExtensionContext) {
	// use workspace to listen to changes to routes file - Thomas
	// let railsCommand = vscode.workspace.getConfiguration().get("railsRoutes");
	let workspaceFolder = vscode.workspace.workspaceFolders;

	if (!workspaceFolder) {
		console.log("Couldn't find workspace");
		return;
	}

	// Check if the current workspace is a Rails project
	// const isRailsProject = fs.existsSync(path.join(workspaceFolder, 'Gemfile'));

	let process = exec(`echo 'Rails.application.routes.named_routes.helper_names' | bundle exec rails c`, { cwd: workspaceFolder[0].uri.fsPath }, (err, stdout, stderr) => {
		let provider = vscode.languages.registerCompletionItemProvider("ruby", {
			provideCompletionItems() {
				const completionItems: vscode.CompletionItem[] = [];
				for (let method of stdout.split(',').slice(1)) {
					method = sanitizeRouteHelper(method);
					console.log(method);
					const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
					item.insertText = method;
					completionItems.push(item);
				}
				return completionItems;
			}
		});
		context.subscriptions.push(provider);
	});

}

function sanitizeRouteHelper(routeHelper: string) {
	return routeHelper.replace(/['"\s\[\]]+/g, '');
}

export function deactivate() { }
