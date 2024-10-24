// Define the default list items
const listItems = [
    "3 sphinx cards",
    "3 hydra cards",
    "3 demon cards",
    "3 angel cards",
    "3 dragon cards",
    "Both monocolor reprints, each of a different color, that together win you the game",
    "1/1 white Rabbit token",
    "2/1 blue Ninja token",
    "3/3 Green Raccoon token",
    "4/4 red Dragon token",
    "Nightmare Copy token",
    "A character from one of our most popular online Magic stories returns",
    "An 8/12 creature with ward 4",
    "A creature with seven evergreen keywords",
    "A Magic Invitational winner’s card gets reprinted (and no, not the most powerful one)",
    "+1/+1 counter",
    "bait counter",
    "fellowship counter",
    "incubation counter",
    "loyalty counter",
    "revival counter",
    "soul counter",
    "stash counter",
    "stun counter",
    "A card that’s in the top 10 cards I sign gets reprinted",
    "More deciduous mechanics get used in this set than any previous (non-Time Spiral block) premier set",
    "“This spell costs {1} less to cast for each Cat you control.”",
    "“You can’t lose the game and your opponents can’t win the game.”",
    "“target instant or sorcery card in your graveyard gains flashback until end of turn.”",
    "“Creatures you control get +10/+10”",
    "“A deck can have any number of cards named”",
    "“Then exile all other Nightmare tokens you control.”",
    "“Whenever you draw your second card each turn, create a token that’s a copy of this creature.”",
    "“Double the number of each kind of counter”",
    "“You may pay {B} rather than pay this spell’s mana cost if there are thirteen or more creatures on the battlefield.”",
    "“Draw a card for each different mana value among nonland permanents you control.”",
    "Creature – Rabbit Noble",
    "Creature – Demon Warlock",
    "Creature – Shark Pirate",
    "Creature – Eldrazi",
    "Creature – Hyena Rogue",
    "Creature – Spider Spirit",
    "Creature – Elemental Hydra",
    "Creature – Bear Demon",
    "Artifact Creature – Phyrexian Construct",
    "Legendary Creature – Zombie Warlock",
    "Boltwave",
    "Electroduplicate",
    "Fishing Pole",
    "Goblin Negotiation",
    "Hare Apparent",
    "Homunculus Horde",
    "Midnight Snack",
    "Perforating Artist",
    "Refute",
    "Stab"
];

// Function to generate the PDF
async function generatePDF() {
    const itemList = document.getElementById('itemList').value; // Get the value from the textarea
    const items = itemList.split(/[\n,]+/).map(item => item.trim()).filter(item => item); // Split by new lines or commas, trim, and filter empty items

    const response = await fetch('http://localhost:3000/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gridSize: 5, items }),  // Adjust grid size as needed
    });

    if (!response.ok) {
        console.error('Error generating PDF:', response.statusText);
        return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bingo.pdf'; // Download the file
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// Set the default value for the textarea when the page loads
window.onload = () => {
    document.getElementById('itemList').value = listItems.join('\n');  // Join items with new lines
};
