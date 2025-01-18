/* 
############################################################################################
####		Created & Developed by João Gabriel Corrêa da Silva (All Rights Reserved)				####
####	    https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	          ####
############################################################################################
*/

(function(){
  const rows = ["Alta", "Média", "Baixa"]; ///probability
  const cols = ["Baixo", "Médio", "Alto"]; ///impact
  const rowThresholds = [33, 66, 100];
  const colThresholds = [3, 10, 15]; 

  const mapToMatrix = (row, col)=>{
    const rowIndex = rowThresholds.findIndex(threshold => row <= threshold);
    const colIndex = colThresholds.findIndex(threshold => col <= threshold);
    return { row: rows[2-rowIndex], col: cols[colIndex] };
  }

  // Número de clusters (por exemplo, baixo, médio, alto risco)
  const k = 3;

  const fakeData = new FakeData(100, (x)=>{
    // const probability = Commom.randomWithK([3, 33, 66, 100]);
    // const impact = Commom.randomWithK([1, 3, 10, 15]);
    // const probability = Commom.random(2, 100);
    // const impact = Commom.random(1, 15);
    const deviation = 0.001;
    const index = Commom.random(0, 3, true);
    const probability = Commom.random(...[
      [3, 50],
      [34, 66],
      [50, 95]
    ][index]) * (1 + Commom.random(0, deviation));
    const impact = Commom.random(...[
      [1, 2],
      [6,9],
      [11, 14]
    ][index]) * (1 + Commom.random(0, deviation));
    const risk = (probability * impact) / (15 * 100)
    return [ impact, probability, risk  / k, 0];
  })

  const orderData = fakeData.sort((a,b)=>a[3] - b[3])
  // console.log(JSON.stringify(orderData))

  // const data = realData.map(x=>x.slice(0,2));

  const predata = orderData.map(x=>x.slice(0,2));


  const execute = ()=>{
    console.log("Executar o K-Means");
    const minValues = [0, 0];
    const maxValues = [15, 100]
  
    let data = KMeans.normalizeData( predata, minValues, maxValues);

    const result = new KMeans(data, k, 1000);

    data = KMeans.unnormalizeData(data, minValues, maxValues);
    result.centroids = KMeans.unnormalizeData(result.centroids, minValues, maxValues);
  
    const chart = new ClusterChart(
      "riskCanvas",
      data,
      result.clusters,
      result.centroids,
      {
        width: 500,
        height: 350,
        y: { name: "Probabilidade (%)", min: 0, max: 100, ticks: 5 },
        x: { name: "Impacto (Milhões $)", min: 0, max: 15, ticks: 5 },
        grid: true,
        // colors: ["#29a346", "#f0c030", "#d62d3c"]
      }
    )
    chart.render();

    const matrixData = data.map((point, index) => {
      const cluster = result.clusters[index];
      const { row, col } = mapToMatrix(point[1], point[0]);
      return { row, col, label: `Risco ${index + 1} (Cluster ${cluster+1})`, index };
    });

    // console.log(matrixData);
  
    const riskMatrix = new RiskMatrix(matrixData, {
      title: "Matriz de Risco",
      rows,
      cols,
      colors: [
        ["#ffeeba", "#f8d7da", "#f8d7da"],
        ["#d4edda", "#ffeeba", "#f8d7da"],
        ["#d4edda", "#d4edda", "#ffeeba"]
      ],
      cellWidth: 100*1.2,
      cellHeight: 50*1.2,
      rowName: "Probabilidade (%)",
      colName: "Impacto (Milhões $)"
    });

    
    chart.on('pointselect', (e)=>{
      riskMatrix.highlight(e.pointIndex);
      console.log(data[e.pointIndex-1])
    });
    chart.on('pointunselect', (e)=>{
      riskMatrix.highlight(-1);
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
    predata.push([ impact, probability ]);
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