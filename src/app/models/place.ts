import { Imodel } from './imodel';

export class Place implements Imodel {
  public id: string;
  public placeName: string;
  public placeReference: string;
  public placeHasParking: boolean;
  public placeMap: string;
  public createdBy: string;
  public createdDate: number;
  public isApproved: boolean;

  constructor(name: string, reference: string, hasParking: boolean, map: string) {
    this.placeName = name;
    this.placeReference = reference;
    this.placeHasParking = hasParking;
    this.placeMap = map;
  }


}
