import { app, Tray, Menu, nativeImage, MenuItemConstructorOptions, shell } from 'electron';
import { appManager } from './AppManager';
import { join } from 'path';
import { State } from '../types/State';
import { Status } from '../types/Status';
import { MapType } from '../types/MapType';

export const defaultMenuItems: MenuItemConstructorOptions[] = [
  {
    label: 'Configure',
    type: 'normal',
    click: () => {
      appManager.getWindow().window.show();
    },
  },
  {
    label: 'Quit',
    type: 'normal',
    click: () => {
      appManager.getWindow().window.destroy();
      app.quit();
    },
  },
];

export const statusToImagePathMap: MapType<string> = {
  [Status.SUCCESS]: join(__dirname, '..', 'assets', 'ok_icon.png'),
  [Status.FAILURE]: join(__dirname, '..', 'assets', 'fail_icon.png'),
  [Status.CHECKING]: join(__dirname, '..', 'assets', 'running_icon.png'),
  [Status.NA]: join(__dirname, '..', 'assets', 'na_icon.png'),
};

export class TrayMenu {
  public readonly tray: Tray;

  constructor() {
    this.tray = new Tray(this.createNativeImage());
    this.tray.setContextMenu(this.createMenu());
  }

  public updateTrayImage(state: State) {
    const image = nativeImage.createFromPath(this.getIconForState(state));
    image.setTemplateImage(true);
    this.tray.setImage(image);
  }

  public updateObserverMenu(observersState: State[]) {
    const observersStateMenuItems: MenuItemConstructorOptions[] = observersState.map((observerState) => {
      return {
        label: observerState.name,
        submenu: [{ label: 'Link', click: () => shell.openExternal(observerState.link) }],
        icon: nativeImage.createFromPath(this.getIconForState(observerState)),
      };
    });
    this.tray.setContextMenu(
      Menu.buildFromTemplate([...observersStateMenuItems, { type: 'separator' }, ...defaultMenuItems])
    );
  }

  private getIconForState(state: State) {
    return statusToImagePathMap[state.status];
  }

  private createNativeImage() {
    const image = nativeImage.createFromPath(statusToImagePathMap[Status.NA]);
    image.setTemplateImage(true);
    return image;
  }

  private createMenu(): Menu {
    const contextMenu = Menu.buildFromTemplate(defaultMenuItems);
    return contextMenu;
  }
}
