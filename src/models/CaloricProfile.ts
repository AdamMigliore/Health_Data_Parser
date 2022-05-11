interface CaloricProfile {
  date: Date;
  caloric_intake: number | undefined;
  caloric_maximum_intake: number | undefined;
  apple_bmr: number | undefined;
  renpho_bmr: number | undefined;
  apple_active: number | undefined;
  weight: number | undefined;
}

export default CaloricProfile;
