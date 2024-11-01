import {CheckGameVersion} from "./CheckGameVersion";

(async () => {

    window.modCheckGameVersion = new CheckGameVersion(
        window,
        window.modSC2DataManager,
        window.modUtils,
    );

})();



