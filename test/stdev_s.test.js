"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stdevs_1 = require("../src/utils/stdevs");
test("stdev_s: success case", () => {
    const data = [0, 1, 2, 3, 4, 5, 6];
    const expected = 2;
    const calculated = (0, stdevs_1.stdev_p)(data);
    expect(calculated).toBe(expected);
});
test("stdev_s: no values", () => {
    const data = [0];
    const expected = 0;
    const calculated = (0, stdevs_1.stdev_p)(data);
    expect(calculated).toBe(expected);
});
test("stdev_s: negative values", () => {
    const data = [-3, -2, -1, 0];
    const expected = 1.1180339887499;
    const calculated = (0, stdevs_1.stdev_p)(data);
    expect(parseFloat(calculated.toFixed(13))).toBe(expected);
});
//# sourceMappingURL=stdev_s.test.js.map