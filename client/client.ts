import {
    DrawTextOnScreenForDuration,
    DrawTextOnScreenThisFrame,
    delay,
} from "@whitigol/fivem-utils";
import { RotAnglesToVec } from "../util/spotlightUtils";
import config from "../util/config";
import { Vector3 } from "../util/vectors";
import { Util } from "@whitigol/menu-api";
import type { SpotlightState } from "../types/types";
/* FiveM Typescript Boilerplate by Whitigol */

//? Start your client script below here.
/* CLIENT SCRPIT */
DecorRegister("spotlight", 2);
DecorRegister("spotlight_lr", 3);
DecorRegister("spotlight_ud", 3);

let mySpotlight = false;
let mySpotlightRotation = Vector3(0, 0, 0);
let lockRot = false;

RegisterCommand(
    "spotlight",
    async () => {
        const playerPed = PlayerPedId();
        const vehicle = GetVehiclePedIsIn(playerPed, false);
        const vehicleClass = GetVehicleClass(vehicle);

        if (!vehicle) {
            return DrawTextOnScreenForDuration(
                "~r~You must be in a vehicle to use spotlight!",
                0.5,
                0.9,
                0.4,
                255,
                0,
                true,
                2000
            );
        }

        if (config.emergencyOnly && vehicleClass !== 18) {
            return DrawTextOnScreenForDuration(
                "~r~Spotlights are for emergency vehicles only!",
                0.5,
                0.9,
                0.4,
                255,
                0,
                true,
                2000
            );
        }

        const isSpotlightOn = DecorGetBool(vehicle, "spotlight");
        DecorSetBool(vehicle, "spotlight", !isSpotlightOn);
        mySpotlight = !isSpotlightOn;

        const moveTick = setTick(async () => {
            while (true) {
                await delay(0);

                DisableControlAction(0, Util.Control.VehicleHorn, true);

                if (
                    IsDisabledControlJustReleased(0, Util.Control.VehicleHorn)
                ) {
                    lockRot = !lockRot;
                }

                DrawTextOnScreenThisFrame(
                    `Spotlight: ${mySpotlight ? "~g~On" : "~r~Off"}`,
                    0.005,
                    0.5,
                    0.3,
                    255,
                    0,
                    false
                );

                if (!DoesEntityExist(vehicle)) {
                    emitNet("spotlight:setSpotlightStateBag", {
                        entity: NetworkGetNetworkIdFromEntity(vehicle),
                        state: false,
                    });
                    return clearTick(moveTick);
                }

                if (mySpotlight) {
                    const _camRot = GetGameplayCamRot(2);
                    const camRot = Vector3(_camRot[0], _camRot[1], _camRot[2]);

                    const lr = camRot.z;
                    const ud = camRot.x;
                    if (!lockRot) {
                        emitNet("spotlight:setSpotlightStateBag", {
                            entity: NetworkGetNetworkIdFromEntity(vehicle),
                            state: true,
                            source: GetPlayerServerId(PlayerId()),
                            rotation: {
                                x: lr,
                                y: ud,
                                z: 0,
                            },
                        });

                        mySpotlightRotation = Vector3(lr, ud, 0);
                    }

                    DrawMySpotlight(
                        vehicle,
                        mySpotlightRotation.x,
                        mySpotlightRotation.y,
                        mySpotlightRotation.z
                    );
                }

                if (!mySpotlight) {
                    emitNet("spotlight:setSpotlightStateBag", {
                        entity: NetworkGetNetworkIdFromEntity(vehicle),
                        state: false,
                    });
                    return clearTick(moveTick);
                }
            }
        });
    },
    false
);

function DrawMySpotlight(veh: number, x: number, y: number, z: number) {
    const rot = RotAnglesToVec(x, y);

    const pos = GetEntityCoords(veh, false);
    const forward = GetEntityForwardVector(veh);
    const forwardPos = Vector3(
        pos[0] + forward[0],
        pos[1] + forward[1],
        pos[2] + forward[2]
    );
    const bone = GetEntityBoneIndexByName(veh, "indicator_lf");
    const bonePos = Vector3(
        GetWorldPositionOfEntityBone(veh, bone)[0],
        GetWorldPositionOfEntityBone(veh, bone)[1],
        GetWorldPositionOfEntityBone(veh, bone)[2]
    );

    DrawSpotLightWithShadow(
        bonePos.x,
        bonePos.y,
        bonePos.z + 0.5,
        rot.x,
        rot.y,
        rot.z + 0.05,
        255,
        229,
        173,
        150.0,
        25.0,
        5.0,
        10.0,
        100.0,
        0
    );
}

const spotlights: SpotlightState[] = [];

AddStateBagChangeHandler(
    "spotlight",
    null,
    async (bagName: string, key: string, value: string) => {
        const entity = GetEntityFromStateBagName(bagName);
        if (!entity) return;

        const state: SpotlightState = JSON.parse(value);
        if (!state) return;

        if (state.state) {
            const index = spotlights.findIndex(
                (spotlight) => spotlight.entity === state.entity
            );
            if (index !== -1) {
                spotlights[index] = state;
            } else {
                spotlights.push(state);
            }
        } else {
            const index = spotlights.findIndex(
                (spotlight) => spotlight.entity === state.entity
            );
            if (index !== -1) {
                spotlights.splice(index, 1);
            }
        }
    }
);

setTick(async () => {
    while (true) {
        await delay(0);

        DrawTextOnScreenThisFrame(
            JSON.stringify(spotlights),
            0.5,
            0.7,
            0.3,
            255,
            0,
            true
        );

        spotlights.forEach((spotlight) => {
            if (spotlight.source === GetPlayerServerId(PlayerId())) return;

            const veh = NetworkGetEntityFromNetworkId(spotlight.entity);
            if (!veh) return;

            const lr = spotlight.rotation.x;
            const ud = spotlight.rotation.y;

            const rot = RotAnglesToVec(lr, ud);

            const pos = GetEntityCoords(veh, false);
            const forward = GetEntityForwardVector(veh);
            const forwardPos = Vector3(
                pos[0] + forward[0],
                pos[1] + forward[1],
                pos[2] + forward[2]
            );
            const bone = GetEntityBoneIndexByName(veh, "indicator_lf");
            const bonePos = Vector3(
                GetWorldPositionOfEntityBone(veh, bone)[0],
                GetWorldPositionOfEntityBone(veh, bone)[1],
                GetWorldPositionOfEntityBone(veh, bone)[2]
            );

            DrawSpotLightWithShadow(
                bonePos.x,
                bonePos.y,
                bonePos.z + 0.5,
                rot.x,
                rot.y,
                rot.z + 0.05,
                255,
                229,
                173,
                150.0,
                25.0,
                5.0,
                10.0,
                100.0,
                0
            );
        });
    }
});
