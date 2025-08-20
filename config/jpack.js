import fs from 'fs';
import path from 'path';
import { LogMe, jPackConfig, removeEmptyDirs } from 'jizy-packer';

async function generateConfigLess() {
    LogMe.log('Generate config.less');
    const desktopBreakpoint = jPackConfig.get('desktopBreakpoint') ?? '768px';
    let lessContent = `@desktop-breakpoint: ${desktopBreakpoint};` + "\n";
    lessContent += `@mobile-breakpoint: @desktop-breakpoint - 1px;`;
    fs.writeFileSync(path.join(jPackConfig.get('assetsPath'), 'config.less'), lessContent);
}

const jPackData = {
    name: 'BrowserCompat',
    alias: 'jizy-browser',
    cfg: 'browser',
    assetsPath: 'dist',

    buildTarget: null,
    buildZip: false,
    buildName: 'default',

    onCheckConfig: () => { },

    onGenerateBuildJs: (code) => {
        generateConfigLess();
        return code;
    },

    onGenerateWrappedJs: (wrapped) => wrapped,

    onPacked: () => { }
};

export default jPackData;

