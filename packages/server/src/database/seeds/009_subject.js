import { truncateTables } from "../../sql/helpers";
import casual from "casual";

export async function seed(knex, Promise) {
  await truncateTables(knex, Promise, ["subject", "activity"]);

  const subjects = [
    {
      name: "Practical Life",
      activities: [
        {
          name: "Washing Hands",
          type: "Care of the Person"
        },
        {
          name: "Dressing Frame Button",
          type: "Care of the Person"
        },
        {
          name: "Polishing Shoes",
          type: "Care of the Person"
        }
      ]
    },
    {
      name: "Sensorial",
      activities: [
        {
          name: "Cylinder Blocks",
          type: "Visual Sense"
        },
        {
          name: "Pink Tower",
          type: "Visual Sense"
        },
        {
          name: "Brown Stairs",
          type: "Visual Sense"
        }
      ]
    },
    {
      name: "Language",
      activities: [
        {
          name: "Sandpaper Letters",
          type: "Written Language"
        },
        {
          name: "Movable Alphabet",
          type: "Written Language"
        },
        {
          name: "Metal Insets",
          type: "Written Language"
        },
        {
          name: "Sorting Symbols",
          type: "Handwriting"
        },
        {
          name: "Phonetic Object Box",
          type: "Reading"
        },
        {
          name: "Phonogram Object Box",
          type: "Reading"
        }
      ]
    },
    {
      name: "Math",
      activities: [
        {
          name: "Number Rods",
          type: "Numbers through Ten"
        },
        {
          name: "Sandpaper Numbers",
          type: "Numbers through Ten"
        },
        {
          name: "Spindle Boxes",
          type: "Numbers through Ten"
        }
      ]
    }
  ];

  await Promise.all(
    subjects.map(async s => {
      const tempSubject = s;
      const subject = await knex("subject")
        .returning("id")
        .insert({
          name: `${s.name}`
        });
      console.log("seeds", "tempSubject", JSON.stringify(tempSubject));
      console.log("seeds", "subject", JSON.stringify(subject));

      await Promise.all(
        tempSubject.activities.map(async a => {
          return knex("activity")
            .returning("id")
            .insert({
              subject: tempSubject.name,
              name: a.name,
              type: a.type
            });
        })
      );
    })
  );
}
