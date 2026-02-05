export interface Card {
  id: string;
  title: string;
  content?: string; // Plain text for previews
  contentHTML?: string; // HTML for the editor
}

export const DEFAULT_CARDS: Card[] = [
  {
    id: "gym",
    title: "Gym",
    content: "how's your training going",
    contentHTML: `
        Monday       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   :           Back <br />
        Tuesday      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   :           Bicep, triceps <br />
        Wednesday    &nbsp;&nbsp;&nbsp;                                       :           Chest <br />
        Thursday     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;               :           Shoulder <br />
        Friday       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    :  Forearm , abs/cardio <br />
        Saturday     &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;         :           Leg <br /> <br />

        Weight       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;               :           62 kg <br />
        Height       &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;               :           ~6'0 ft <br /> <br />

        Daily protein need : 62 × 1.5 =  ~ ( 90-100 g) <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    `,
  },
  {
    id: "poems",
    title: "Poems",
    content:
      "write something beautiful you listened today",
    contentHTML: `
    For as long as              <br/>
    i exists,                   <br/>
    you will always             <br/>
    be loved.
      <br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>
    `,
  },
];
