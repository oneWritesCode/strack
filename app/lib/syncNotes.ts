export async function syncNotesWithDatabase() {
  try {
    const isSynced = localStorage.getItem("isSynced");

    if (isSynced === "true") {
      // isSynced is true — push all local notes to the DB
      const localCardsStr = localStorage.getItem("skilltracker_cards");
      const localCards = localCardsStr ? JSON.parse(localCardsStr) : [];

      for (const card of localCards) {
        const storageKey = `extra_card_${card.id}`;
        const contentStr = localStorage.getItem(storageKey);
        let contentJSON = null;

        if (contentStr) {
          try {
            const parsed = JSON.parse(contentStr);
            contentJSON = parsed.content;
          } catch (e) {
            console.error("Failed to parse extra_card data", e);
          }
        }

        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: card.id,
            title: card.title,
            category: card.category || "none",
            isStarred: card.isStarred || false,
            isListNote: false,
            content: card.content || null,
            contentHTML: card.contentHTML || null,
            contentJSON: contentJSON ? JSON.stringify(contentJSON) : null,
          }),
        });
      }

      return;
    }

    // isSynced is not true — keep the existing flow
    // 1. Fetch the notes from the database
    const res = await fetch("/api/notes");
    if (!res.ok) {
      // Might not be logged in or other error
      return;
    }

    const dbNotes = await res.json();
    const dbNotesMap = new Map(dbNotes.map((notes: any) => [notes.id, notes]));

    // 2. Fetch the notes from Local Storage
    const localCardsStr = localStorage.getItem("skilltracker_cards");
    const localCards = localCardsStr ? JSON.parse(localCardsStr) : [];

    // 3. Compare and find what's missing in DB (exists locally, but not in DB)
    const missingInDb = localCards.filter(
      (card: any) => !dbNotesMap.has(card.id),
    );

    // Send missing data to DB
    for (const card of missingInDb) {
      const storageKey = `extra_card_${card.id}`;
      const contentStr = localStorage.getItem(storageKey);
      let contentJSON = null;

      if (contentStr) {
        try {
          const parsed = JSON.parse(contentStr);
          contentJSON = parsed.content;
        } catch (e) {
          console.error("Failed to parse extra_card data", e);
        }
      }

      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: card.id,
          title: card.title,
          category: card.category || "none",
          isStarred: card.isStarred || false,
          isListNote: false,
          content: card.content || null,
          contentHTML: card.contentHTML || null,
          contentJSON: contentJSON ? JSON.stringify(contentJSON) : null,
        }),
      });
    }

    // 4. Fetch the unified state from DB again since we just pushed to it
    // Then overwrite localStorage with the latest so old/missing data is replaced!
    const updatedRes = await fetch("/api/notes");
    if (!updatedRes.ok) return;

    const allDbNotes = await updatedRes.json();

    const newLocalCards = allDbNotes.map((note: any) => {
      // Only restore the extra_card info if there's actual content JSON!
      if (note.contentJSON) {
        try {
          localStorage.setItem(
            `extra_card_${note.id}`,
            JSON.stringify({
              content: JSON.parse(note.contentJSON),
              lastUpdated: note.updatedAt,
            }),
          );
        } catch (e) {
          console.error("Failed to deserialize db note JSON", e);
        }
      }

      return {
        id: note.id,
        title: note.title,
        category: note.category || "none",
        isStarred: note.isStarred,
        content: note.content || null,
        contentHTML: note.contentHTML || null,
      };
    });

    // Write back over skilltracker_cards, removing old/deleted disconnected data entirely from memory
    localStorage.setItem("skilltracker_cards", JSON.stringify(newLocalCards));
  } catch (error) {
    console.error("Error syncing notes:", error);
  }
}

