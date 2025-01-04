/* 
############################################################################################
####		Created & Developed by João Gabriel Corrêa da Silva (All Rights Reserved)				####
####	    https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	          ####
############################################################################################
*/

(function(){
  const rows = ["Baixo", "Médio", "Alto"];
  const cols = ["Baixo", "Médio", "Alto"];
  const rowThresholds = [33, 66, 100];
  const colThresholds = [3, 10, 15]; 

  const mapToMatrix = (row, col)=>{
    const rowIndex = rowThresholds.findIndex(threshold => row <= threshold);
    const colIndex = colThresholds.findIndex(threshold => col <= threshold);
    return { row: rows[rowIndex], col: cols[colIndex] };
  }

  // Número de clusters (por exemplo, baixo, médio, alto risco)
  const k = 3;

  const fakeData = new FakeData(50, (x)=>{
    const probability = Commom.randomWithK([5, 15, 34, 55, 50, 75, 80, 90]);
    const impact = Commom.randomWithK([0.5,  5, 6, 7, 8, 9, 14]);
    const risk = (probability * impact) / (15 * 100)
    return [ probability, impact, risk  / k];
  })
  const data = fakeData.map(x=>x.slice(0,2));

  const execute = ()=>{
    console.log("Executar o K-Means");
    const result = new KMeans(data, k);
  
    const chart = new ClusterChart("riskCanvas", data, result.clusters, result.centroids, {
      x: { name: "Probabilidade (%)", min: 0, max: 100, ticks: 5 },
      y: { name: "Impacto (Milhões)", min: 0, max: 15, ticks: 5 },
      grid: true,
      //colors: ["#25cf4e", "#edbc26", "#e62e3f"]
    });
    chart.render();

    const matrixData = data.map((point, index) => {
      const cluster = result.clusters[index];
      const { row, col } = mapToMatrix(point[0], point[1]);
      return { row, col, label: `Risco ${index + 1} (Cluster ${cluster+1})` };
    });
  
    const riskMatrix = new RiskMatrix(matrixData, {
      title: "Matriz de Risco",
      rows,
      cols,
      colors: ["#d4edda", "#ffeeba", "#f8d7da"],
      cellWidth: 100,
      cellHeight: 50,
    });
  
    riskMatrix.render();
  }

  const probabilityInput = document.getElementById('probability');
  const impactInput = document.getElementById('impact');

  const randomButton = document.getElementById('random');
  const addExtraButton = document.getElementById('addExtra');

  randomButton.addEventListener('click', ()=>{
    const probability = Commom.randomWithK([5, 15, 20, 30, 45, 50, 75, 80, 90, 95]);
    const impact = Commom.randomWithK([0.5, 1, 2, 3, 4, 5, 6.6, 7, 8, 9, 10, 12, 15]);
    probabilityInput.value = probability;
    impactInput.value = impact;
  })

  addExtraButton.addEventListener('click', ()=>{
    const probability = parseFloat(probabilityInput.value);
    const impact = parseFloat(impactInput.value);
    const risk = (probability * impact) / (15 * 100);
    data.push([ probability, impact ]);
    execute();
  })


  // console.log("Executar o K-NN");
  // // Rótulos (1 = Alto Risco, 0 = Baixo Risco)
  // const labels = fakeData.map(x=>x.slice(2,3));
  
  // // Ponto de teste
  // const testPoint = [70, 4]; // Probabilidade 70%, Impacto 4 milhões
  
  // // Classificar o ponto de teste
  // const riskLevel = new KNN(data, labels, testPoint, k);
  
  // console.log(`O nível de risco do evento testado é: ${riskLevel === "1" ? "Alto" : "Baixo"}`);
  execute();
})()