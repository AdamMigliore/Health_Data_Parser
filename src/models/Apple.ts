/**
 *
 *  <Record type="HKQuantityTypeIdentifierActiveEnergyBurned"
 * sourceName="Adam’s Apple Watch"
 * sourceVersion="8.5.1"
 * device="&lt;&lt;HKDevice: 0x281da8af0&gt;, name:Apple Watch, manufacturer:Apple Inc., model:Watch, hardware:Watch5,9, software:8.5.1&gt;"
 * unit="Cal" creationDate="2022-05-02 17:40:27 -0400"
 * startDate="2022-05-02 17:38:55 -0400"
 * endDate="2022-05-02 17:39:56 -0400"
 * value="1.572"/>
 *
 */

interface AppleDataModel {
  type:
    | "HKQuantityTypeIdentifierActiveEnergyBurned"
    | "HKQuantityTypeIdentifierBasalEnergyBurned";
  sourceName: string;
  creationDate: Date;
  value: number;
  startDate: string;
  endDate: string;
}

export default AppleDataModel;
