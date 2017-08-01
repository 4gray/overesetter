'use strict';

const { app, Menu, globalShortcut, ipcMain } = require('electron');
const menubar = require('menubar');
const AutoLaunch = require('auto-launch');

const keyboardShortcuts = {
	open: 'CommandOrControl+Alt+T'
}

const mb = menubar({
	index: 'file://' + __dirname + '/index.html',
	width: 500,
	height: 325,
	resizable: false,
	preloadWindow: true,
	transparent: true,
	frame: false,
	showDockIcon: false
});

mb.on('ready', () => {

	// create the application's main menu
	const template = [{
		label: "Menu",
		submenu: [
			{ label: "Hide", accelerator: "Esc", click: () => mb.window.hide() },
			{ label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
			{ label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
			{ label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
			{ label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectall" },
			{
				label: 'Toggle Developer Tools',
				accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
				click(item, focusedWindow) {
					if (focusedWindow) focusedWindow.webContents.toggleDevTools()
				}
			},
			{
				label: "Quit",
				accelerator: "Command+Q",
				click: () => app.quit()
			}
		]
	}
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));

	// register show window shortcut listener
	globalShortcut.register(keyboardShortcuts.open, () => {
		mb.window.isVisible() ? mb.window.hide() : mb.showWindow();
	});

	ipcMain.on('autolaunch', (event, arg) => {
		console.log('Autolaunch enabled: ' + arg);
		arg ? appLauncher.enable() : appLauncher.disable();
	});

});

let appLauncher = new AutoLaunch({
	name: 'Oversetter',
	mac: {
		useLaunchAgent: true,
	}
});

appLauncher.isEnabled()
	.then(isEnabled => {
		if (isEnabled) return;
		appLauncher.enable();
	})
	.catch(err => console.error(err));

app.on('will-quit', () => {
	// unregister all shortcuts
	globalShortcut.unregisterAll();
})