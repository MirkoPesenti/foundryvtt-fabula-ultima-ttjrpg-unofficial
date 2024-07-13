import { Fabula } from "./modules/config.mjs";
import FUItemSheet from "./modules/sheets/FUItemSheet.mjs";

Hooks.once("init", function () {
  console.log("Fabula Ultima | Initialising Fabula Ultima TTJRPG (Unofficial)");

  CONFIG.Fabula = Fabula;

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet("futtjrp", FUItemSheet, { makeDefault: true });
});
