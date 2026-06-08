export interface LocalFood {
    id: number;
    nome: string;
    categoria: string;
    cal: number;
    prot: number;
    carb: number;
    fat: number;
}

// Valores nutricionais por 100g — baseado na TACO (Tabela Brasileira de Composição de Alimentos)
export const FOODS: LocalFood[] = [
    // ── Cereais e derivados ──
    { id: 1,  nome: "Arroz branco cozido",       categoria: "Cereais",   cal: 128, prot: 2.6,  carb: 28.1, fat: 0.2 },
    { id: 2,  nome: "Arroz integral cozido",      categoria: "Cereais",   cal: 124, prot: 2.6,  carb: 25.8, fat: 1.0 },
    { id: 3,  nome: "Macarrão cozido",            categoria: "Cereais",   cal: 149, prot: 4.9,  carb: 29.0, fat: 1.1 },
    { id: 4,  nome: "Pão francês",                categoria: "Cereais",   cal: 300, prot: 8.0,  carb: 58.6, fat: 3.1 },
    { id: 5,  nome: "Pão de forma integral",      categoria: "Cereais",   cal: 253, prot: 9.4,  carb: 45.6, fat: 4.2 },
    { id: 6,  nome: "Pão de forma branco",        categoria: "Cereais",   cal: 265, prot: 8.0,  carb: 49.0, fat: 3.4 },
    { id: 7,  nome: "Aveia em flocos",            categoria: "Cereais",   cal: 394, prot: 13.9, carb: 66.6, fat: 8.5 },
    { id: 8,  nome: "Granola",                    categoria: "Cereais",   cal: 438, prot: 8.6,  carb: 65.0, fat: 16.3 },
    { id: 9,  nome: "Tapioca (goma hidratada)",   categoria: "Cereais",   cal: 135, prot: 0.2,  carb: 33.7, fat: 0.1 },
    { id: 10, nome: "Farinha de trigo",           categoria: "Cereais",   cal: 361, prot: 9.8,  carb: 75.1, fat: 1.4 },
    { id: 11, nome: "Cuscuz de milho cozido",     categoria: "Cereais",   cal: 136, prot: 2.7,  carb: 28.7, fat: 0.8 },
    { id: 12, nome: "Batata-doce cozida",         categoria: "Cereais",   cal: 77,  prot: 1.4,  carb: 18.4, fat: 0.1 },

    // ── Leguminosas ──
    { id: 13, nome: "Feijão carioca cozido",      categoria: "Leguminosas", cal: 77,  prot: 4.8,  carb: 13.6, fat: 0.5 },
    { id: 14, nome: "Feijão preto cozido",        categoria: "Leguminosas", cal: 77,  prot: 4.5,  carb: 14.0, fat: 0.5 },
    { id: 15, nome: "Lentilha cozida",            categoria: "Leguminosas", cal: 93,  prot: 7.8,  carb: 15.3, fat: 0.5 },
    { id: 16, nome: "Grão-de-bico cozido",        categoria: "Leguminosas", cal: 164, prot: 8.9,  carb: 27.4, fat: 2.6 },
    { id: 17, nome: "Ervilha cozida",             categoria: "Leguminosas", cal: 70,  prot: 5.4,  carb: 11.5, fat: 0.3 },
    { id: 18, nome: "Soja cozida",                categoria: "Leguminosas", cal: 141, prot: 14.0, carb: 11.5, fat: 6.0 },

    // ── Carnes e aves ──
    { id: 19, nome: "Frango peito grelhado",      categoria: "Carnes",    cal: 159, prot: 32.0, carb: 0.0,  fat: 2.7 },
    { id: 20, nome: "Frango coxa cozida",         categoria: "Carnes",    cal: 190, prot: 19.4, carb: 0.0,  fat: 11.5 },
    { id: 21, nome: "Frango sobrecoxa assada",    categoria: "Carnes",    cal: 220, prot: 18.7, carb: 0.0,  fat: 15.2 },
    { id: 22, nome: "Carne bovina patinho",       categoria: "Carnes",    cal: 219, prot: 21.0, carb: 0.0,  fat: 14.0 },
    { id: 23, nome: "Carne bovina acém cozido",   categoria: "Carnes",    cal: 242, prot: 19.8, carb: 0.0,  fat: 17.5 },
    { id: 24, nome: "Carne bovina picanha",       categoria: "Carnes",    cal: 363, prot: 20.9, carb: 0.0,  fat: 30.7 },
    { id: 25, nome: "Carne moída refogada",       categoria: "Carnes",    cal: 287, prot: 22.2, carb: 0.0,  fat: 21.7 },
    { id: 26, nome: "Frango filé mignon",         categoria: "Carnes",    cal: 165, prot: 31.0, carb: 0.0,  fat: 3.6 },
    { id: 27, nome: "Alcatra grelhada",           categoria: "Carnes",    cal: 170, prot: 28.0, carb: 0.0,  fat: 5.8 },
    { id: 28, nome: "Contrafilé grelhado",        categoria: "Carnes",    cal: 255, prot: 26.4, carb: 0.0,  fat: 15.8 },

    // ── Peixes e frutos do mar ──
    { id: 29, nome: "Atum em lata (água)",        categoria: "Peixes",    cal: 108, prot: 24.4, carb: 0.0,  fat: 0.9 },
    { id: 30, nome: "Salmão grelhado",            categoria: "Peixes",    cal: 208, prot: 20.4, carb: 0.0,  fat: 13.4 },
    { id: 31, nome: "Tilápia grelhada",           categoria: "Peixes",    cal: 128, prot: 26.2, carb: 0.0,  fat: 2.7 },
    { id: 32, nome: "Sardinha em lata",           categoria: "Peixes",    cal: 163, prot: 20.5, carb: 0.0,  fat: 8.3 },
    { id: 33, nome: "Camarão cozido",             categoria: "Peixes",    cal: 99,  prot: 20.9, carb: 0.9,  fat: 1.1 },
    { id: 34, nome: "Merluza assada",             categoria: "Peixes",    cal: 103, prot: 21.7, carb: 0.0,  fat: 2.0 },

    // ── Ovos ──
    { id: 35, nome: "Ovo inteiro cozido",         categoria: "Ovos",      cal: 146, prot: 13.0, carb: 0.6,  fat: 9.5 },
    { id: 36, nome: "Ovo mexido",                 categoria: "Ovos",      cal: 175, prot: 11.2, carb: 1.6,  fat: 13.5 },
    { id: 37, nome: "Clara de ovo cozida",        categoria: "Ovos",      cal: 52,  prot: 10.9, carb: 0.7,  fat: 0.2 },

    // ── Laticínios ──
    { id: 38, nome: "Leite integral",             categoria: "Laticínios", cal: 61,  prot: 3.2,  carb: 4.7,  fat: 3.3 },
    { id: 39, nome: "Leite desnatado",            categoria: "Laticínios", cal: 35,  prot: 3.4,  carb: 4.9,  fat: 0.2 },
    { id: 40, nome: "Iogurte integral natural",   categoria: "Laticínios", cal: 66,  prot: 3.8,  carb: 6.3,  fat: 3.0 },
    { id: 41, nome: "Iogurte grego natural",      categoria: "Laticínios", cal: 97,  prot: 9.0,  carb: 3.6,  fat: 5.0 },
    { id: 42, nome: "Queijo mussarela",           categoria: "Laticínios", cal: 289, prot: 21.4, carb: 2.6,  fat: 21.6 },
    { id: 43, nome: "Queijo cottage",             categoria: "Laticínios", cal: 98,  prot: 11.1, carb: 3.4,  fat: 4.3 },
    { id: 44, nome: "Queijo prato",               categoria: "Laticínios", cal: 356, prot: 23.6, carb: 2.3,  fat: 28.1 },
    { id: 45, nome: "Requeijão cremoso",          categoria: "Laticínios", cal: 246, prot: 8.4,  carb: 3.2,  fat: 22.9 },
    { id: 46, nome: "Whey protein (pó)",          categoria: "Laticínios", cal: 380, prot: 74.0, carb: 10.0, fat: 5.0 },
    { id: 47, nome: "Manteiga",                   categoria: "Laticínios", cal: 726, prot: 0.9,  carb: 0.1,  fat: 80.5 },

    // ── Frutas ──
    { id: 48, nome: "Banana prata",               categoria: "Frutas",    cal: 92,  prot: 1.3,  carb: 23.8, fat: 0.1 },
    { id: 49, nome: "Banana maçã",               categoria: "Frutas",    cal: 87,  prot: 1.1,  carb: 22.8, fat: 0.1 },
    { id: 50, nome: "Maçã",                       categoria: "Frutas",    cal: 56,  prot: 0.3,  carb: 15.2, fat: 0.1 },
    { id: 51, nome: "Laranja pera",               categoria: "Frutas",    cal: 46,  prot: 1.0,  carb: 11.5, fat: 0.1 },
    { id: 52, nome: "Uva itália",                 categoria: "Frutas",    cal: 69,  prot: 0.9,  carb: 17.0, fat: 0.2 },
    { id: 53, nome: "Melancia",                   categoria: "Frutas",    cal: 33,  prot: 0.7,  carb: 7.5,  fat: 0.2 },
    { id: 54, nome: "Mamão formosa",              categoria: "Frutas",    cal: 40,  prot: 0.6,  carb: 10.4, fat: 0.1 },
    { id: 55, nome: "Manga tommy",               categoria: "Frutas",    cal: 64,  prot: 0.7,  carb: 16.6, fat: 0.3 },
    { id: 56, nome: "Abacate",                    categoria: "Frutas",    cal: 96,  prot: 1.2,  carb: 6.0,  fat: 8.4 },
    { id: 57, nome: "Morango",                    categoria: "Frutas",    cal: 30,  prot: 0.9,  carb: 6.7,  fat: 0.3 },
    { id: 58, nome: "Abacaxi",                    categoria: "Frutas",    cal: 48,  prot: 0.9,  carb: 12.3, fat: 0.1 },
    { id: 59, nome: "Kiwi",                       categoria: "Frutas",    cal: 61,  prot: 1.0,  carb: 14.6, fat: 0.6 },

    // ── Verduras e legumes ──
    { id: 60, nome: "Alface crespa",              categoria: "Verduras",  cal: 11,  prot: 1.3,  carb: 1.7,  fat: 0.2 },
    { id: 61, nome: "Tomate",                     categoria: "Verduras",  cal: 15,  prot: 1.1,  carb: 3.1,  fat: 0.2 },
    { id: 62, nome: "Cebola",                     categoria: "Verduras",  cal: 37,  prot: 1.0,  carb: 8.6,  fat: 0.1 },
    { id: 63, nome: "Alho",                       categoria: "Verduras",  cal: 98,  prot: 3.5,  carb: 20.0, fat: 0.5 },
    { id: 64, nome: "Cenoura crua",               categoria: "Verduras",  cal: 34,  prot: 1.3,  carb: 7.7,  fat: 0.2 },
    { id: 65, nome: "Batata inglesa cozida",      categoria: "Verduras",  cal: 52,  prot: 1.2,  carb: 11.9, fat: 0.1 },
    { id: 66, nome: "Batata-doce cozida",         categoria: "Verduras",  cal: 77,  prot: 1.4,  carb: 18.4, fat: 0.1 },
    { id: 67, nome: "Abobrinha cozida",           categoria: "Verduras",  cal: 20,  prot: 1.1,  carb: 3.7,  fat: 0.2 },
    { id: 68, nome: "Brócolis cozido",            categoria: "Verduras",  cal: 35,  prot: 3.8,  carb: 5.0,  fat: 0.4 },
    { id: 69, nome: "Espinafre cozido",           categoria: "Verduras",  cal: 28,  prot: 2.9,  carb: 3.7,  fat: 0.5 },
    { id: 70, nome: "Couve refogada",             categoria: "Verduras",  cal: 50,  prot: 3.1,  carb: 5.0,  fat: 1.8 },
    { id: 71, nome: "Beterraba cozida",           categoria: "Verduras",  cal: 40,  prot: 1.9,  carb: 8.4,  fat: 0.1 },
    { id: 72, nome: "Chuchu cozido",              categoria: "Verduras",  cal: 18,  prot: 0.7,  carb: 3.6,  fat: 0.2 },
    { id: 73, nome: "Inhame cozido",              categoria: "Verduras",  cal: 109, prot: 1.4,  carb: 25.5, fat: 0.1 },
    { id: 74, nome: "Mandioca cozida",            categoria: "Verduras",  cal: 125, prot: 0.6,  carb: 30.1, fat: 0.3 },
    { id: 75, nome: "Pepino",                     categoria: "Verduras",  cal: 11,  prot: 0.8,  carb: 2.2,  fat: 0.1 },

    // ── Oleaginosas e sementes ──
    { id: 76, nome: "Amendoim torrado",           categoria: "Oleaginosas", cal: 567, prot: 26.0, carb: 16.1, fat: 43.9 },
    { id: 77, nome: "Pasta de amendoim",          categoria: "Oleaginosas", cal: 592, prot: 25.1, carb: 20.3, fat: 50.0 },
    { id: 78, nome: "Castanha-do-pará",           categoria: "Oleaginosas", cal: 656, prot: 14.3, carb: 15.1, fat: 63.5 },
    { id: 79, nome: "Castanha de caju torrada",   categoria: "Oleaginosas", cal: 570, prot: 16.2, carb: 29.1, fat: 44.8 },
    { id: 80, nome: "Amêndoa torrada",            categoria: "Oleaginosas", cal: 612, prot: 21.5, carb: 19.0, fat: 52.8 },
    { id: 81, nome: "Semente de girassol",        categoria: "Oleaginosas", cal: 582, prot: 23.4, carb: 18.0, fat: 47.5 },
    { id: 82, nome: "Linhaça",                    categoria: "Oleaginosas", cal: 495, prot: 18.3, carb: 28.9, fat: 32.3 },
    { id: 83, nome: "Chia",                       categoria: "Oleaginosas", cal: 490, prot: 16.5, carb: 42.1, fat: 30.7 },

    // ── Óleos e gorduras ──
    { id: 84, nome: "Azeite de oliva",            categoria: "Óleos",     cal: 884, prot: 0.0,  carb: 0.0,  fat: 100.0 },
    { id: 85, nome: "Óleo de coco",               categoria: "Óleos",     cal: 892, prot: 0.0,  carb: 0.0,  fat: 100.0 },
    { id: 86, nome: "Óleo de soja",               categoria: "Óleos",     cal: 884, prot: 0.0,  carb: 0.0,  fat: 100.0 },

    // ── Embutidos e industrializados ──
    { id: 87, nome: "Presunto cozido",            categoria: "Embutidos", cal: 141, prot: 17.0, carb: 2.1,  fat: 7.0 },
    { id: 88, nome: "Peito de peru defumado",     categoria: "Embutidos", cal: 115, prot: 16.9, carb: 3.9,  fat: 3.5 },
    { id: 89, nome: "Salsicha cozida",            categoria: "Embutidos", cal: 232, prot: 12.0, carb: 2.8,  fat: 19.5 },

    // ── Lanches e fast food ──
    { id: 90, nome: "Hambúrguer bovino",          categoria: "Lanches",   cal: 295, prot: 17.0, carb: 0.0,  fat: 25.0 },
    { id: 91, nome: "Pizza mussarela (fatia 80g)",categoria: "Lanches",   cal: 250, prot: 10.0, carb: 29.0, fat: 10.0 },
    { id: 92, nome: "Batata frita",               categoria: "Lanches",   cal: 312, prot: 3.8,  carb: 39.6, fat: 15.5 },
    { id: 93, nome: "Biscoito cream cracker",     categoria: "Lanches",   cal: 442, prot: 10.0, carb: 67.0, fat: 13.0 },
    { id: 94, nome: "Biscoito recheado",          categoria: "Lanches",   cal: 483, prot: 5.1,  carb: 68.6, fat: 21.4 },

    // ── Bebidas ──
    { id: 95, nome: "Suco de laranja natural",    categoria: "Bebidas",   cal: 44,  prot: 0.8,  carb: 10.2, fat: 0.1 },
    { id: 96, nome: "Suco de uva integral",       categoria: "Bebidas",   cal: 65,  prot: 0.6,  carb: 16.0, fat: 0.2 },
    { id: 97, nome: "Vitamina de banana",         categoria: "Bebidas",   cal: 74,  prot: 2.5,  carb: 15.0, fat: 0.8 },

    // ── Doces e sobremesas ──
    { id: 98,  nome: "Açúcar refinado",           categoria: "Doces",     cal: 387, prot: 0.0,  carb: 99.5, fat: 0.0 },
    { id: 99,  nome: "Mel",                       categoria: "Doces",     cal: 309, prot: 0.4,  carb: 84.0, fat: 0.0 },
    { id: 100, nome: "Chocolate ao leite",        categoria: "Doces",     cal: 535, prot: 7.7,  carb: 57.2, fat: 31.0 },
    { id: 101, nome: "Chocolate amargo 70%",      categoria: "Doces",     cal: 552, prot: 7.3,  carb: 33.0, fat: 42.6 },

    // ── Preparações típicas brasileiras ──
    { id: 102, nome: "Feijão tropeiro",           categoria: "Pratos",    cal: 198, prot: 9.3,  carb: 20.0, fat: 9.5 },
    { id: 103, nome: "Frango com batata",         categoria: "Pratos",    cal: 142, prot: 14.0, carb: 10.0, fat: 5.0 },
    { id: 104, nome: "Arroz com feijão",          categoria: "Pratos",    cal: 105, prot: 3.7,  carb: 21.5, fat: 0.5 },
    { id: 105, nome: "Omelete simples",           categoria: "Pratos",    cal: 185, prot: 12.5, carb: 1.0,  fat: 14.5 },
    { id: 106, nome: "Caldo de feijão",           categoria: "Pratos",    cal: 68,  prot: 4.0,  carb: 11.2, fat: 1.3 },
    { id: 107, nome: "Strogonoff de frango",      categoria: "Pratos",    cal: 192, prot: 13.8, carb: 7.8,  fat: 12.2 },
    { id: 108, nome: "Frango xadrez",             categoria: "Pratos",    cal: 138, prot: 14.5, carb: 8.2,  fat: 5.2 },

    // ── Suplementos ──
    { id: 109, nome: "Whey isolado",              categoria: "Suplementos", cal: 368, prot: 82.0, carb: 5.0,  fat: 2.0 },
    { id: 110, nome: "Albumina",                  categoria: "Suplementos", cal: 360, prot: 80.0, carb: 5.0,  fat: 1.5 },
    { id: 111, nome: "Creatina monohidratada",    categoria: "Suplementos", cal: 0,   prot: 0.0,  carb: 0.0,  fat: 0.0 },
    { id: 112, nome: "Pasta de amendoim proteica",categoria: "Suplementos", cal: 520, prot: 35.0, carb: 18.0, fat: 32.0 },
];

const NORMALIZE: Record<string, string> = { á: "a", à: "a", ã: "a", â: "a", é: "e", ê: "e", í: "i", ó: "o", õ: "o", ô: "o", ú: "u", ç: "c" };

function normalize(s: string): string {
    return s.toLowerCase().replace(/[áàãâéêíóõôúç]/g, c => NORMALIZE[c] ?? c);
}

export function searchFoods(query: string): LocalFood[] {
    if (query.trim().length < 2) return [];
    const q = normalize(query.trim());
    const terms = q.split(/\s+/);
    return FOODS.filter(f => {
        const n = normalize(f.nome);
        return terms.every(t => n.includes(t));
    }).slice(0, 25);
}
