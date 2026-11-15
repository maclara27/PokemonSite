// Script para gerar notas completas em Português para todos os 1025 Pokémon
const fs = require('fs');
const path = require('path');

const notesPath = path.join(__dirname, '..', 'src', 'data', 'notes.json');
const notes = JSON.parse(fs.readFileSync(notesPath, 'utf-8'));

async function main() {
  console.log('Buscando lista completa de 1025 espécies...');
  const res = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
  const data = await res.json();
  const speciesList = data.results;

  // Dicionário temático para enriquecer os textos por geração e família
  const regionNames = {
    3: 'Hoenn',
    4: 'Sinnoh',
    5: 'Unova',
    6: 'Kalos',
    7: 'Alola',
    8: 'Galar e Hisui',
    9: 'Paldea'
  };

  function getRegion(id) {
    if (id <= 151) return 'Kanto';
    if (id <= 251) return 'Johto';
    if (id <= 386) return 'Hoenn';
    if (id <= 493) return 'Sinnoh';
    if (id <= 649) return 'Unova';
    if (id <= 721) return 'Kalos';
    if (id <= 809) return 'Alola';
    if (id <= 905) return 'Galar e Hisui';
    return 'Paldea';
  }

  function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
  }

  const traits = [
    (n, r) => `Espécime muito curioso registrado durante expedições pela região de ${r}. Demonstra hábitos territoriais marcantes e reflexos ágeis na vegetação nativa.`,
    (n, r) => `Observado com frequência em biomas característicos de ${r}. Seus movimentos fluidos e temperamento atento intrigam pesquisadores e viajantes.`,
    (n, r) => `Possui anatomia adaptada com perfeição ao clima de ${r}. Consegue armazenar energia vital e responder prontamente a variações atmosféricas.`,
    (n, r) => `Criatura fascinante cujas habilidades de combate e instintos de sobrevivência foram documentados com admiração nos arquivos zoológicos de ${r}.`,
    (n, r) => `Habitante distinto de ${r}, reconhecido pela resistência física e pelos sentidos aguçados na identificação de companheiros e recursos naturais.`,
    (n, r) => `Registros de campo destacam seu comportamento leal e inteligência tática quando convive em grupos integrados no ecossistema de ${r}.`,
    (n, r) => `Espécime admirável catalogado com precisão. Demonstra grande destreza em seu habitat natural nas florestas, cavernas e planícies de ${r}.`,
    (n, r) => `Relatos de naturalistas apontam uma fisiologia singular com controle refinado sobre suas técnicas elementais ao longo das trilhas de ${r}.`
  ];

  let added = 0;
  for (let i = 0; i < speciesList.length; i++) {
    const id = i + 1;
    const strId = String(id);
    const item = speciesList[i];
    const name = formatName(item.name);
    const region = getRegion(id);

    if (!notes[strId] || notes[strId].trim().length === 0) {
      const traitIndex = (id * 7 + name.length) % traits.length;
      const desc = `${name}: ${traits[traitIndex](name, region)}`;
      notes[strId] = desc;
      added++;
    }
  }

  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2), 'utf-8');
  console.log(`Concluído! Total de notas em notes.json: ${Object.keys(notes).length}. Novas notas adicionadas: ${added}`);
}

main().catch(err => {
  console.error('Erro ao gerar notas:', err);
  process.exit(1);
});

