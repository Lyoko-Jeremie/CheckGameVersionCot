import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {Sc2EventTracerCallback} from "../../../dist-BeforeSC2/Sc2EventTracer";
// import type {LifeTimeCircleHook} from "../../../dist-BeforeSC2/ModLoadController";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import {isString, findLastIndex} from 'lodash';


export class CheckGameVersion
    implements Sc2EventTracerCallback
    // implements LifeTimeCircleHook
{
    private log: LogWrapper;

    constructor(
        public thisWindow: Window,
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.log = this.gModUtils.getLogger();
        this.gSC2DataManager.getSc2EventTracer().addCallback(this);
        // this.gSC2DataManager.getModLoadController().addLifeTimeCircleHook('CheckGameVersionCot', this);
        this.version = this.getVersionStringFromPassageItemDataContent();
    }

    version: string | undefined;

    getVersionStringFromPassageItemDataContent() {
        // <<\W*set\W+([^<]+)\W+to\W+"([^<]+)"\W*>>

        // <<set Config.saves.version to "v0.5.4f">>
        //
        // <<set $versions to [Config.saves.version]>>
        // <<widget "version">><<highlight version>><<print Config.saves.version>><</highlight>><</widget>>

        const content = this.gSC2DataManager.getSC2DataInfoCache().passageDataItems.map.get('Version')?.content;
        if (!content) {
            console.error('[CheckGameVersionCot] getVersionStringFromPassageItemDataContent() content not found');
            return undefined;
        }

        const m = Array.from(content.matchAll(/<<\W*set\W+([^<]+)\W+to\W+"([^<]+)"\W*>>/gm));
        if (m.length < 1) {
            console.error('[CheckGameVersionCot] getVersionStringFromPassageItemDataContent() m not match');
            return undefined;
        }
        console.log('[CheckGameVersionCot] getVersionStringFromPassageItemDataContent() m:', m);
        console.log('[CheckGameVersionCot] getVersionStringFromPassageItemDataContent() m[0]:', m[0]);

        if (m[0].length < 2) {
            console.error('[CheckGameVersionCot] getVersionStringFromPassageItemDataContent() m[0].length < 2');
            return undefined;
        }
        const v = m[0][2];
        console.log('[CheckGameVersionCot] getVersionStringFromPassageItemDataContent() version:', v);
        return v;
    }

    doCheckGameVersion() {
        // const v = window?.Config?.saves?.version;
        // const v = this.getVersionStringFromPassageItemDataContent();
        const v = this.version;
        if (!isString(v)) {
            console.error('[CheckGameVersionCot] checkGameVersion() version not string', v);
            this.log.error(`[CheckGameVersionCot] checkGameVersion() version not string: ${v}`);
            return;
        }
        let vv = v.split('-')[0];
        if (vv.startsWith('v')) {
            vv = vv.slice(1);
        }
        // find last index of number
        const lastNumberIndex = findLastIndex(vv, (c) => {
            return c >= '0' && c <= '9';
        });
        // if lastNumberIndex is not last one , insert a `-` in it
        if (lastNumberIndex !== vv.length - 1) {
            vv = vv.slice(0, lastNumberIndex + 1) + '-' + vv.slice(lastNumberIndex + 1);
        }
        this.gameVersionString = vv;
        this.gSC2DataManager.getDependenceChecker().checkGameVersion(vv);
        console.log('[CheckGameVersionCot] checkGameVersion() gameVersionString:', this.gameVersionString);
        this.log.log(`[CheckGameVersionCot] checkGameVersion() gameVersionString:[${this.gameVersionString}]`);
        console.log('[CheckGameVersionCot] checkGameVersion() gameVersionString:', this.gSC2DataManager.getDependenceChecker().getInfiniteSemVerApi().parseVersion(this.gameVersionString));
        this.log.log(`[CheckGameVersionCot] checkGameVersion() gameVersionString:${this.gSC2DataManager.getDependenceChecker().getInfiniteSemVerApi().parseVersion(this.gameVersionString).version.version}`);
    }

    // whenSC2StoryReady() {
    //     this.checkGameVersion();
    // }

    gameVersionString?: string;

    whenSC2PassageDisplay() {
        if (this.gameVersionString) {
            return;
        }
        this.doCheckGameVersion();
    }

}

