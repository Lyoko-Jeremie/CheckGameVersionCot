import type {LogWrapper} from "../../../dist-BeforeSC2/ModLoadController";
import type {SC2DataManager} from "../../../dist-BeforeSC2/SC2DataManager";
import type {Sc2EventTracerCallback} from "../../../dist-BeforeSC2/Sc2EventTracer";
import type {ModUtils} from "../../../dist-BeforeSC2/Utils";
import {isString, findLastIndex} from 'lodash';

export class CheckGameVersion implements Sc2EventTracerCallback {
    private log: LogWrapper;

    constructor(
        public thisWindow: Window,
        public gSC2DataManager: SC2DataManager,
        public gModUtils: ModUtils,
    ) {
        this.log = this.gModUtils.getLogger();
        this.gSC2DataManager.getSc2EventTracer().addCallback(this);
    }

    checkGameVersion() {
        const v = window?.Config?.saves?.version;
        if (!isString(v)) {
            console.error('[CheckGameVersionCot] checkGameVersion() Config.saves.version not string', v);
            this.log.error(`[CheckGameVersionCot] checkGameVersion() Config.saves.version not string: ${v}`);
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
        this.checkGameVersion();
    }

}

