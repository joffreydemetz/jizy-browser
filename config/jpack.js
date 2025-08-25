import fs from 'fs';
import path from 'path';
import { LogMe, jPackConfig } from 'jizy-packer';

const jPackData = function () {
    jPackConfig.sets({
        name: 'BrowserCompat',
        alias: 'jizy-browser',
        desktopBreakpoint: "900px"
    });

    jPackConfig.set('onCheckConfig', () => { });

    jPackConfig.set('onGenerateBuildJs', (code) => {
        LogMe.log('Generate config.less');
        LogMe.log('  path: ' + path.join(jPackConfig.get('targetPath'), 'config.less'));
        const desktopBreakpoint = jPackConfig.get('desktopBreakpoint') ?? '768px';
        let lessContent = `@desktop-breakpoint: ${desktopBreakpoint};` + "\n";
        lessContent += `@mobile-breakpoint: @desktop-breakpoint - 1px;`;
        fs.writeFileSync(path.join(jPackConfig.get('targetPath'), 'config.less'), lessContent);
        return code;
    });

    jPackConfig.set('onGenerateWrappedJs', (wrapped) => wrapped);

    jPackConfig.set('onPacked', () => { });
};

export default jPackData;
