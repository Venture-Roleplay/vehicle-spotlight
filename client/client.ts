import {
    DrawTextOnScreenForDuration,
    DrawTextOnScreenThisFrame,
    delay,
} from "@whitigol/fivem-utils";
import config from "../util/config";
/* FiveM Typescript Boilerplate by Whitigol */
/* CLIENT SCRPIT */

let spotlight = {
    status: false,
    up_down: 0.0,
    left_right: 0.0,
    rotationSpeed: 1,
};

RegisterCommand(
    "spotlight",
    async () => {
        if (spotlight.status) {
            spotlight.status = false;
            return;
        }

        const ped = PlayerPedId();
        const veh = GetVehiclePedIsIn(ped, false);
        const vehBone = GetEntityBoneIndexByName(veh, "bonnet");
        const initPos = GetWorldPositionOfEntityBone(veh, vehBone);

        if (!DoesEntityExist(veh)) {
            DrawTextOnScreenForDuration(
                "~r~Vehicle Does Not Exist~w~",
                1,
                0.5,
                0.5,
                255,
                1,
                true,
                2000
            );
            return;
        }

        const model = GetHashKey("prop_w_spotlight_01");
        RequestModel(model);
        while (!HasModelLoaded(model)) await delay(0);
        spotlight.status = true;

        const obj = CreateObject(
            model,
            initPos[0],
            initPos[1],
            initPos[2],
            true,
            true,
            false
        );

        const tick = setTick(async () => {
            while (true) {
                await delay(0);

                DrawTextOnScreenThisFrame(
                    "Spotlight ~g~ON~w~",
                    0.01,
                    0.5,
                    0.3,
                    255,
                    0,
                    false
                );

                AttachEntityToEntity(
                    obj,
                    veh,
                    GetEntityBoneIndexByName(veh, "bonnet"),
                    0.0 - 1,
                    0.0,
                    0.0 + 0.5,
                    0.0,
                    0.0 + spotlight.up_down,
                    0.0 - spotlight.left_right,
                    true,
                    true,
                    false,
                    true,
                    1,
                    true
                );

                if (IsUsingKeyboard(0)) {
                    if (IsControlPressed(0, 107)) {
                        spotlight.left_right += spotlight.rotationSpeed;
                    }

                    if (IsControlPressed(0, 108)) {
                        spotlight.left_right -= spotlight.rotationSpeed;
                    }

                    if (IsControlPressed(0, 111)) {
                        spotlight.up_down += spotlight.rotationSpeed;
                    }

                    if (IsControlPressed(0, 112)) {
                        spotlight.up_down -= spotlight.rotationSpeed;
                    }
                }

                if (!spotlight.status) {
                    spotlight.up_down = 0.0;
                    spotlight.left_right = 0.0;
                    DeleteEntity(obj);
                    clearTick(tick);
                    return;
                }

                if (!DoesEntityExist(veh) || !NetworkHasControlOfEntity(veh)) {
                    DeleteEntity(obj);
                    clearTick(tick);
                    spotlight.status = false;
                    spotlight.up_down = 0.0;
                    spotlight.left_right = 0.0;
                    return;
                }

                if (IsEntityDead(veh)) {
                    DeleteEntity(obj);
                    clearTick(tick);
                    spotlight.status = false;
                    spotlight.up_down = 0.0;
                    spotlight.left_right = 0.0;
                    return;
                }
            }
        });
    },
    false
);
