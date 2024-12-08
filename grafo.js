import { exec } from "child_process";
import fs from "fs";

class Grafo {
  constructor() {
    this.adjacencias = {};
  }

  adicionarVertice(vertice) {
    if (!this.adjacencias[vertice]) {
      this.adjacencias[vertice] = [];
    }
  }

  adicionarAresta(origem, destino, peso = 1) {
    this.adjacencias[origem].push({ destino, peso });
    this.adjacencias[destino].push({ destino: origem, peso });
  }

  gerarVisualizacao(nomeArquivo = "grafo") {
    let grafoDOT = "graph G {\n";

    for (let origem in this.adjacencias) {
      for (let aresta of this.adjacencias[origem]) {
        if (origem < aresta.destino) {
          grafoDOT += `  ${origem} -- ${aresta.destino} [label="${aresta.peso}"];\n`;
        }
      }
    }

    grafoDOT += "}\n";

    // Escrever o arquivo DOT
    fs.writeFileSync(`${nomeArquivo}.dot`, grafoDOT);

    // Usar o comando 'dot' para gerar a imagem PNG
    exec(`dot -Tpng ${nomeArquivo}.dot -o ${nomeArquivo}.png`, (err) => {
      if (err) {
        console.error("Erro ao gerar a visualização do grafo:", err);
      } else {
        console.log(`Arquivo gerado: ${nomeArquivo}.png`);
      }
    });
  }
}

// Exemplo de Uso
const grafo = new Grafo();
grafo.adicionarVertice("A");
grafo.adicionarVertice("B");
grafo.adicionarVertice("C");
grafo.adicionarVertice("D");
grafo.adicionarVertice("E");

grafo.adicionarAresta("A", "B", 2);
grafo.adicionarAresta("A", "C", 3);
grafo.adicionarAresta("B", "D", 1);
grafo.adicionarAresta("C", "D", 4);
grafo.adicionarAresta("D", "E", 4);
grafo.adicionarAresta("C", "E", 5);

console.log("Gerando o grafo...");
grafo.gerarVisualizacao("meu_grafo");


//!==================================================================
//!=================Caminhos/Circuitos-Eulerianos====================
//!==================================================================


class GrafoEuler extends Grafo {
  verificarEuleriano() {
    let verticesImpares = 0;

    for (let vertice in this.adjacencias) {
      if (this.adjacencias[vertice].length % 2 !== 0) {
        verticesImpares++;
      }
    }

    if (verticesImpares === 0) {
      return "Circuito Euleriano";
    } else if (verticesImpares === 2) {
      return "Caminho Euleriano";
    } else {
      return "Não é Euleriano";
    }
  }

  gerarVisualizacaoEuleriano(nomeArquivo = "grafo_euleriano") {
    const resultado = this.verificarEuleriano();
    this.gerarVisualizacao(nomeArquivo);
    console.log(`Resultado: ${resultado}`);
  }
}

// Exemplo
const grafoEuler = new GrafoEuler();
grafoEuler.adicionarVertice("A");
grafoEuler.adicionarVertice("B");
grafoEuler.adicionarVertice("C");
grafoEuler.adicionarVertice("D");
grafoEuler.adicionarVertice("E");

grafoEuler.adicionarAresta("A", "B");
grafoEuler.adicionarAresta("B", "C");
grafoEuler.adicionarAresta("C", "D");
grafoEuler.adicionarAresta("D", "A");
grafoEuler.adicionarAresta("D", "E");
grafoEuler.adicionarAresta("C", "E");


grafoEuler.gerarVisualizacaoEuleriano("grafo_euler");


//!==================================================================
//!=====================Algoritmo-de-Dijkstra========================
//!==================================================================

class GrafoDijkstra extends Grafo {
  encontrarMenorCaminho(inicio, fim) {
    const distancias = {};
    const anteriores = {};
    const visitados = new Set();

    for (let vertice in this.adjacencias) {
      distancias[vertice] = Infinity;
      anteriores[vertice] = null;
    }
    distancias[inicio] = 0;

    while (true) {
      let verticeAtual = null;

      for (let vertice in distancias) {
        if (!visitados.has(vertice)) {
          if (verticeAtual === null || distancias[vertice] < distancias[verticeAtual]) {
            verticeAtual = vertice;
          }
        }
      }

      if (verticeAtual === null || verticeAtual === fim) {
        break;
      }

      visitados.add(verticeAtual);

      for (let vizinho of this.adjacencias[verticeAtual]) {
        let novaDistancia = distancias[verticeAtual] + vizinho.peso;
        if (novaDistancia < distancias[vizinho.destino]) {
          distancias[vizinho.destino] = novaDistancia;
          anteriores[vizinho.destino] = verticeAtual;
        }
      }
    }

    const caminho = [];
    let atual = fim;
    while (atual !== null) {
      caminho.unshift(atual);
      atual = anteriores[atual];
    }

    return { distancia: distancias[fim], caminho };
  }

  gerarVisualizacaoDijkstra(inicio, fim, nomeArquivo = "grafo_dijkstra") {
    const { caminho } = this.encontrarMenorCaminho(inicio, fim);
    let grafoDOT = "graph G {\n";

    for (let origem in this.adjacencias) {
      for (let aresta of this.adjacencias[origem]) {
        const isCaminho = caminho.includes(origem) && caminho.includes(aresta.destino);
        grafoDOT += `  ${origem} -- ${aresta.destino} [label="${aresta.peso}" color="${isCaminho ? "red" : "black"}"];\n`;
      }
    }

    grafoDOT += "}\n";

    fs.writeFileSync(`${nomeArquivo}.dot`, grafoDOT);
    exec(`dot -Tpng ${nomeArquivo}.dot -o ${nomeArquivo}.png`, (err) => {
      if (err) {
        console.error("Erro ao gerar o grafo:", err);
      } else {
        console.log(`Arquivo gerado: ${nomeArquivo}.png`);
      }
    });
  }
}

// Exemplo
const grafoDijkstra = new GrafoDijkstra();
grafoDijkstra.adicionarVertice("A");
grafoDijkstra.adicionarVertice("B");
grafoDijkstra.adicionarVertice("C");
grafoDijkstra.adicionarVertice("D");
grafoDijkstra.adicionarVertice("E");

grafoDijkstra.adicionarAresta("A", "B", 1);
grafoDijkstra.adicionarAresta("A", "C", 4);
grafoDijkstra.adicionarAresta("B", "C", 2);
grafoDijkstra.adicionarAresta("C", "D", 1);
grafoDijkstra.adicionarAresta("D", "E",4);
grafoDijkstra.adicionarAresta("C", "E",5);

grafoDijkstra.gerarVisualizacaoDijkstra("A", "D", "grafo_dijkstra");
