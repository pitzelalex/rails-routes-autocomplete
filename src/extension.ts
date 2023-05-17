import * as vscode from 'vscode';
import { exec } from "child_process";

export function activate(context: vscode.ExtensionContext) {
	let workspaceFolder = vscode.workspace.workspaceFolders;

	if (!workspaceFolder) {
		console.log("Couldn't find workspace");
		return;
	}

	addRouteAutoCmp(context, workspaceFolder);

	const routesFileWatcher = vscode.workspace.createFileSystemWatcher('**/config/routes.rb');
	context.subscriptions.push(routesFileWatcher);
	routesFileWatcher.onDidChange(() => {
		addRouteAutoCmp(context, workspaceFolder as readonly vscode.WorkspaceFolder[]);
});

	// Check if the current workspace is a Rails project
	// const isRailsProject = fs.existsSync(path.join(workspaceFolder, 'Gemfile'));

}

function sanitizeRouteHelper(routeHelper: string) {
	return routeHelper.replace(/['"\s\[\]]+/g, '');
}

async function addRouteAutoCmp(context: vscode.ExtensionContext, workspaceFolder: readonly vscode.WorkspaceFolder[]){
	exec(`echo 'Rails.application.routes.named_routes.helper_names' | bundle exec rails c`, { cwd: workspaceFolder[0].uri.fsPath }, (err, stdout, stderr) => {
		let provider = vscode.languages.registerCompletionItemProvider("ruby", {
			provideCompletionItems() {
				const completionItems: vscode.CompletionItem[] = [];
				for (let method of stdout.split(',').slice(1)) {
					method = sanitizeRouteHelper(method);
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

export function deactivate() { }
