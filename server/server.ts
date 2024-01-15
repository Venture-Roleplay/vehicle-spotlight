import config from "../util/config";
import type { SpotlightState } from "../types/types";
/* FiveM Typescript Boilerplate by Whitigol */

//? Start your server script below here.
/* SERVER SCRIPT */
onNet("spotlight:setSpotlightStateBag", (state: SpotlightState) => {
    const entity = NetworkGetEntityFromNetworkId(state.entity);
    Entity(entity).state["spotlight"] = JSON.stringify(state);
});
