/* 
############################################################################################
####		Created & Developed by João Gabriel Corrêa da Silva (All Rights Reserved)				####
####	    https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	          ####
############################################################################################
*/

class Commom {
  static euclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, value, index) => sum + Math.pow(value - point2[index], 2), 0)
    );
  }
  static random(min, max, isInt = false){
    const value = Math.random() * (max - min) + min
    return isInt ? Math.floor(value): value;
  }

  static randomWithK(probabilities = [0, 100], deviation = 0.1){
    return probabilities[this.random(0, probabilities.length - 1, true)] * (1 + this.random(-deviation, deviation));
  }

  static removeDuplicates(array = []){
    return array.filter((x, i)=>array.indexOf(x) === i);
  }
}

class KMeans2 {
  euclideanDistance(point1, point2) {
    return Commom.euclideanDistance(point1, point2);
  }

  initializeCentroids(data, k) {
    const centroids = [];
    while (centroids.length < k) {
      const randomIndex = Math.floor(Math.random() * data.length);
      if (!centroids.some((centroid) => centroid === data[randomIndex])) {
        centroids.push([...data[randomIndex]]);
      }
    }
    return centroids;
  }

  assignClusters(data, centroids) {
    return data.map((point) => {
      let closestCentroid = 0;
      let minDistance = Infinity;
      centroids.forEach((centroid, index) => {
        const distance = this.euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      return closestCentroid;
    });
  }

  updateCentroids(data, clusters, k) {
    const newCentroids = Array.from({ length: k }, () =>
      Array(data[0].length).fill(0)
    );
    const clusterSizes = Array(k).fill(0);

    data.forEach((point, index) => {
      const clusterIndex = clusters[index];
      clusterSizes[clusterIndex]++;
      point.forEach((value, dim) => {
        newCentroids[clusterIndex][dim] += value;
      });
    });

    return newCentroids.map((centroid, index) =>
      centroid.map((value) => value / (clusterSizes[index] || 1))
    );
  }

  constructor(data, k, maxIterations = 100) {
    let centroids = this.initializeCentroids(data, k);
    let clusters = [];
    let iterations = 0;

    while (iterations < maxIterations) {
      const newClusters = this.assignClusters(data, centroids);
      const newCentroids = this.updateCentroids(data, newClusters, k);

      if (JSON.stringify(clusters) === JSON.stringify(newClusters)) break;

      clusters = newClusters;
      centroids = newCentroids;
      iterations++;
    }

    return { clusters, centroids };
  }
}

class KMeans {
  static normalizeData(data, minValues, maxValues) {  
    return data.map((point) =>
      point.map((value, dim) => (value - minValues[dim]) / (maxValues[dim] - minValues[dim]))
    );
  }

  static unnormalizeData(data, minValues, maxValues) {
    return data.map((point) =>
      point.map((value, dim) => value * (maxValues[dim] - minValues[dim]) + minValues[dim]
    ));
  }

  static findOptimalK(data, maxK = 10) {
    const distortions = [];
  
    for (let k = 1; k <= maxK; k++) {
      const kmeans = new KMeans(data, k);
      const { centroids, clusters } = kmeans;
  
      const distortion = data.reduce((sum, point, index) => {
        const centroid = centroids[clusters[index]];
        return sum + Commom.euclideanDistance(point, centroid) ** 2;
      }, 0);
  
      distortions.push(distortion);
    }
  
    return distortions;
  }
  

  euclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce((sum, value, index) => sum + (value - point2[index]) ** 2, 0)
    );
  }

  initializeCentroids(data, k) {
    const centroids = [];
    if(data.length === 0) return centroids;
    centroids.push([...data[Math.floor(Math.random() * data.length)]]);
    while (centroids.length < k) {
      const distances = data.map((point) =>
        Math.min(...centroids.map((centroid) => this.euclideanDistance(point, centroid)))
      );
      const totalDistance = distances.reduce((sum, d) => sum + d, 0);
      const probabilities = distances.map((d) => d / totalDistance);
      const cumulativeProbabilities = probabilities.reduce(
        (acc, prob) => [...acc, acc[acc.length - 1] + prob],
        [0]
      );
      const random = Math.random();
      const chosenIndex = cumulativeProbabilities.findIndex((cumProb) => cumProb > random);
      centroids.push([...data[chosenIndex]]);
    }
    return centroids;
  }

  assignClusters(data, centroids) {
    return data.map((point) => {
      let closestCentroid = 0;
      let minDistance = Infinity;
      centroids.forEach((centroid, index) => {
        const distance = this.euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          closestCentroid = index;
        }
      });
      return closestCentroid;
    });
  }

  updateCentroids(data, clusters, k) {
    if(data.length === 0) return []
    const newCentroids = Array.from({ length: k }, () =>
      Array(data[0].length).fill(0)
    );
    const clusterSizes = Array(k).fill(0);

    data.forEach((point, index) => {
      const clusterIndex = clusters[index];
      clusterSizes[clusterIndex]++;
      point.forEach((value, dim) => {
        newCentroids[clusterIndex][dim] += value;
      });
    });

    newCentroids.forEach((centroid, index) => {
      if (clusterSizes[index] === 0) {
        const randomPoint = data[Math.floor(Math.random() * data.length)];
        centroid.splice(0, centroid.length, ...randomPoint);
      } else {
        centroid.forEach((_, dim) => {
          centroid[dim] /= clusterSizes[index];
        });
      }
    });

    return newCentroids;
  }

  constructor(data = [], k = 1, maxIterations = 100, tolerance = 1e-9) {
    let centroids = this.initializeCentroids(data, k);
    let clusters = [];
    let iterations = 0;

    while (iterations < maxIterations) {
      const newClusters = this.assignClusters(data, centroids);
      const newCentroids = this.updateCentroids(data, newClusters, k);

      const centroidShift = centroids.reduce((sum, centroid, index) => {
        const shift = this.euclideanDistance(centroid, newCentroids[index]);
        return sum + shift;
      }, 0);

      if (centroidShift < tolerance) break;

      clusters = newClusters;
      centroids = newCentroids;
      iterations++;
    }

    return { clusters, centroids };
  }
}


class KNN {
  euclideanDistance(point1, point2) {
    return Commom.euclideanDistance(point1, point2);
  }
  
  constructor(trainingData, labels, testPoint, k) {
    const distances = trainingData.map((dataPoint, index) => ({
      distance: this.euclideanDistance(dataPoint, testPoint),
      label: labels[index],
    }));
  
    distances.sort((a, b) => a.distance - b.distance);
  
    const nearestNeighbors = distances.slice(0, k);
  
    const labelCounts = nearestNeighbors.reduce((counts, neighbor) => {
      counts[neighbor.label] = (counts[neighbor.label] || 0) + 1;
      return counts;
    }, {});
  
    return Object.keys(labelCounts).reduce((a, b) => (labelCounts[a] > labelCounts[b] ? a : b));
  }
}


class FakeData {
  constructor(size = 1, eachFunction = (x)=>x){
    return new Array(size).fill([]).map(x=>eachFunction(x));
  }
}

class ClusterChart {
  static defaultOptions = {
    colors: ["#1d91b5","#390385","#066b5f", "#064f6b", "#3d5fc4", "#7a5491"],
    padding: 50, // Aumentei o padding para espaço melhor entre eixos e dados
    width: 1000,
    height: 600,
    x: {
      name: "x",
      min: null, // Valores mínimos e máximos podem ser fixados
      max: null,
    },
    y: {
      name: "y",
      min: null,
      max: null,
    }
  };

  constructor(canvasId, data, clusters, centroids, options = ClusterChart.defaultOptions) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.data = data;
    this.clusters = clusters;
    this.centroids = centroids;

    this.options = { ...ClusterChart.defaultOptions, ...options };

    this.xMin = this.options.x.min ?? Math.min(...data.map(x => x[0]));
    this.xMax = this.options.x.max ?? Math.max(...data.map(x => x[0]));
    this.yMin = this.options.y.min ?? Math.min(...data.map(x => x[1]));
    this.yMax = this.options.y.max ?? Math.max(...data.map(x => x[1]));

    this.calculateScale();

    this.hoverCluster = -1;
    this.hoverPoint = -1;
    this.selectedCluster = -1;
    this.selectedPoint = -1;

    this.eventListener = [];

    this.interact();
  }

  calculateScale() {
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;

    this.canvas.style.width = this.options.width + 'px';
    this.canvas.style.height = this.options.height + 'px';

    this.padding = this.options.padding;

    // Calcula a escala fixa com base nos limites definidos
    this.scaleX = (this.canvas.width - 2 * this.padding) / (this.xMax - this.xMin);
    this.scaleY = (this.canvas.height - 2 * this.padding) / (this.yMax - this.yMin);
  }

  scalePoint(point) {
    return [
      this.padding + (point[0] - this.xMin) * this.scaleX, // Ajusta pela escala fixa do eixo X
      this.canvas.height - this.padding - (point[1] - this.yMin) * this.scaleY, // Ajusta pela escala fixa do eixo Y
    ];
  }

  drawPoint(x, y, r, color, index, hover) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, r, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.font = "8px Arial";
    this.ctx.fillStyle = color;
    if(index && hover) this.ctx.fillText(index+1, x + 5, y - 5);
  }

  drawTick(position, axis, label) {
    this.ctx.beginPath();
    if (axis === "x") {
      // Desenha tick no eixo X
      this.ctx.moveTo(position, this.canvas.height - this.padding - 5);
      this.ctx.lineTo(position, this.canvas.height - this.padding + 5);
      this.ctx.strokeStyle = "#777";
      this.ctx.stroke();
      if (label) {
        this.ctx.font = "10px Arial";
        this.ctx.fillStyle = "#777";
        this.ctx.fillText(label, position, this.canvas.height - this.padding + 10);
      }
    } else if (axis === "y") {
      this.ctx.moveTo(this.padding - 5, position);
      this.ctx.lineTo(this.padding + 5, position);
      this.ctx.stroke();
      if (label) {
        this.ctx.font = "10px Arial";
        this.ctx.fillStyle = "#777";
        this.ctx.fillText(label, this.padding - 20, position + 3);
      }
    }
  }

  drawGrid() {
    if (!this.options.grid) return;

    const xStep = (this.xMax - this.xMin) / this.options.x.ticks;
    const yStep = (this.yMax - this.yMin) / this.options.y.ticks;

    this.ctx.strokeStyle = "#ddd";
    this.ctx.lineWidth = 1;

    for (let i = 1; i <= this.options.x.ticks; i++) {
      const x = this.padding + i * ((this.canvas.width - 2 * this.padding) / this.options.x.ticks);
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.padding);
      this.ctx.lineTo(x, this.canvas.height - this.padding);
      this.ctx.stroke();
    }

    for (let i = 1; i <= this.options.y.ticks; i++) {
      const y = this.canvas.height - this.padding - i * ((this.canvas.height - 2 * this.padding) / this.options.y.ticks);
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.canvas.width - this.padding, y);
      this.ctx.stroke();
    }
  }

  drawAxes() {
    // Desenha os eixos fixos (sem mover)
    const origin = this.scalePoint([this.xMin, this.yMin]);
    const xEnd = this.scalePoint([this.xMax, this.yMin]);
    const yEnd = this.scalePoint([this.xMin, this.yMax]);

    // Eixo X
    this.ctx.beginPath();
    this.ctx.moveTo(origin[0], origin[1]);
    this.ctx.lineTo(xEnd[0], xEnd[1]);
    this.ctx.strokeStyle = "#777";
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Eixo Y
    this.ctx.beginPath();
    this.ctx.moveTo(origin[0], origin[1]);
    this.ctx.lineTo(yEnd[0], yEnd[1]);
    this.ctx.stroke();

    // Rótulos dos eixos
    this.ctx.font = "16px 'Gilroy', 16px 'Segoe UI', 16px Tahoma, 16px Geneva, 16px Verdana, 16px sans-serif";
    this.ctx.fillStyle = "#777";
    this.ctx.textAlign="center"; 
    this.ctx.textBaseline = "middle";

    // Rótulo do eixo X
    this.ctx.fillText(
      this.options.x.name,
      (xEnd[0] + origin[0]) / 2,
      origin[1] + this.padding / 1.5
    );

    // Rótulo do eixo Y
    this.ctx.save();
    this.ctx.translate(origin[0] - this.padding / 1.5, (origin[1] + yEnd[1]) / 2);
    this.ctx.rotate(-Math.PI / 2);
    this.ctx.fillText(this.options.y.name, 0, 0);
    this.ctx.restore();

    const xStep = (this.xMax - this.xMin) / this.options.x.ticks;
    for (let i = 0; i <= this.options.x.ticks; i++) {
      const xValue = this.xMin + i * xStep;
      const position = this.scalePoint([xValue, this.yMin])[0];
      this.drawTick(position, "x", xValue.toFixed(1));
    }

    const yStep = (this.yMax - this.yMin) / this.options.y.ticks;
    for (let i = 0; i <= this.options.y.ticks; i++) {
      const yValue = this.yMin + i * yStep;
      const position = this.scalePoint([this.xMin, yValue])[1];
      this.drawTick(position, "y", yValue.toFixed(1));
    }
  }

  getColorByCluster(cluster){
    return this.options.colors[cluster];
  }

  drawLegend(){
    let x = this.padding / 4;
    let y = this.padding / 4;
    this.centroids.forEach((point, index) => {
      const scaledPoint = this.scalePoint(point);
      const color = this.options.colors[index];
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, 10, 10);
      this.ctx.fillStyle = "#777";
      this.ctx.textAlign="start"; 
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(`Cluster ${index+1}`, x + 15, y + 6.5 );
      x += 60;
    });
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawLegend();
    this.drawGrid();
    this.drawAxes();
    this.data.forEach((point, index) => {
      const scaledPoint = this.scalePoint(point);
      const color = this.getColorByCluster(this.clusters[index]);
      const isHover = this.hoverPoint === index;
      const isSelected = this.selectedPoint === index;
      
      this.drawPoint(scaledPoint[0], scaledPoint[1], isSelected? 4: isHover? 3: 2, color, index, isHover);
      
      if(this.hoverCluster === this.clusters[index] || isSelected){
        this.ctx.strokeStyle = color + '55';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
    this.centroids.forEach((point, index) => {
      const scaledPoint = this.scalePoint(point);
      const color = this.options.colors[index];
      this.drawPoint(scaledPoint[0], scaledPoint[1], 5, color);
      if(this.hoverCluster === index){        
        this.ctx.strokeStyle = color + '55';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
  }

  on(eventName, eventHandler = (eventData)=>{}){
    this.eventListener.push({
      eventName,
      eventHandler
    });
  }

  dispatchEvent(eventName, eventData = {}){
    this.eventListener.forEach((listener) => {
      if(listener.eventName === eventName && typeof listener.eventHandler === "function"){
        listener.eventHandler({
          eventName, ...eventData
        });
      }
    })
  }

  interact(){
    this.canvas.addEventListener('mousemove', (e)=>{
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.hoverCluster = -1;
      this.hoverPoint = -1
      for (let index = 0; index < this.data.length; index++) {
        const point = this.data[index];
        const [px, py] = this.scalePoint(point);
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if(distance < 2.5) {
          this.hoverCluster = this.clusters[index];          
          this.hoverPoint = index;
          break;
        }
      }

      if(this.hoverCluster === -1) {
        for (let index = 0; index < this.centroids.length; index++) {
          const point = this.centroids[index];
          const [px, py] = this.scalePoint(point);
          const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
          if(distance < 2.5) {
            this.hoverCluster = index;
            break;
          }
        }
      }

      if(this.hoverCluster !== -1) this.dispatchEvent('clusterhover', {clusterIndex: this.hoverCluster});
      if(this.hoverPoint !== -1) this.dispatchEvent('pointhover', {pointIndex: this.hoverPoint});

      if(this.hoverCluster === -1) this.dispatchEvent('clusterleave', {clusterIndex: null});
      if(this.hoverPoint === -1) this.dispatchEvent('pointleave', {pointIndex: null});

      this.render();
    });

    this.canvas.addEventListener('mousedown', (e)=>{
      this.selectedCluster = this.hoverCluster;
      if(this.selectedCluster !== -1) this.dispatchEvent('clusterselect', {clusterIndex: this.selectedCluster});
      this.selectedPoint = this.hoverPoint;
      if(this.selectedPoint !== -1) this.dispatchEvent('pointselect', {pointIndex: this.selectedPoint});

      if(this.selectedCluster === -1) this.dispatchEvent('clusterunselect', {clusterIndex: null});
      if(this.selectedPoint === -1) this.dispatchEvent('pointunselect', {pointIndex: null});
      this.render();
    });

    // this.canvas.addEventListener('mouseup', (e)=>{
    //   this.selectedCluster = -1;
    //   this.selectedPoint = -1;
    //   this.render();
    // });
  }

}

class RiskMatrix {
  static defaultOptions = {
    rows: ["Low", "Medium", "High"],
    cols: ["Low", "Medium", "High"],
    containerId: "risk-matrix",
    // colors: ["#d4edda", "#ffeeba", "#f8d7da"],
    colors: [
      ["#d4edda", "#ffeeba", "#ffeeba"],
      ["#ffeeba", "#ffeeba", "#f8d7da"],
      ["#ffeeba", "#f8d7da", "#f8d7da"]
    ],
    cellWidth: 100,
    cellHeight: 50,
    title: "Risk Matrix",
    rowName: "Probability",
    colName: "Impact"
  };

  constructor(data, options = RiskMatrix.defaultOptions) {
    this.data = data; // Dados de entrada: {row: "Medium", col: "High", label: "Risk A"}
    this.options = { ...RiskMatrix.defaultOptions, ...options };
    this.container = document.getElementById(this.options.containerId);

    if (!this.container) {
      throw new Error(`Container with ID "${this.options.containerId}" not found.`);
    }
  }

  titleStyling(titleElement, vertical = false){
    titleElement.style.display = "flex";
    titleElement.style.justifyContent = "center";
    titleElement.style.alignItems = "center";
    titleElement.style.fontSize = "xx-small";
    titleElement.style.fontWeight = "bold";
    titleElement.style.padding = "5px";
    titleElement.style.whiteSpace = "nowrap";
    if(vertical) titleElement.style.width = `${this.options.cellHeight / 2}px`;
    else titleElement.style.height = `${this.options.cellHeight / 2}px`;
  }

  cellBackgroundColor(rowIndex, colIndex){
    return Array.isArray(this.options.colors[rowIndex])? this.options.colors[rowIndex][colIndex]: this.options.colors[rowIndex];
  }

  createMatrix() {
    // Limpa o contêiner
    this.container.innerHTML = "";

    // Adiciona título
    const title = document.createElement("h3");
    title.textContent = this.options.title;
    title.style.textAlign = "center";
    this.container.appendChild(title);

    // Cria o grid principal
    const grid = document.createElement("div");
    grid.style.display = "inline-grid";
    // grid.style.gridTemplateColumns = `repeat(${this.options.cols.length + 2}, ${this.options.cellWidth}px)`;
    // grid.style.gridTemplateRows = `repeat(${this.options.rows.length + 2}, ${this.options.cellHeight}px)`;
    grid.style.gridTemplateColumns = `${this.options.cols.length + 2}`;
    grid.style.gridTemplateRows = `${this.options.rows.length + 2}`;
    grid.style.color = "#333";

    // Adiciona cabeçalhos
    const colTitleCell = document.createElement("div");
    colTitleCell.innerHTML = this.options.colName;
    colTitleCell.style.gridColumnStart = "2"
    colTitleCell.style.gridColumnEnd = `${this.options.cols.length + 3}`
    colTitleCell.style.color = "#fff";
    this.titleStyling(colTitleCell);
    grid.appendChild(colTitleCell);

    
    const emptyCell = document.createElement("div"); // Célula vazia no canto superior esquerdo
    grid.appendChild(emptyCell);


    this.options.cols.forEach((col) => {
      const header = document.createElement("div");
      header.textContent = col;
      header.style.width = `${this.options.cellWidth}px`;
      header.style.height = `${this.options.cellHeight}px`;
      header.style.textAlign = "center";
      header.style.fontWeight = "bold";
      header.style.fontSize = "12px";
      header.style.border = "1px solid #ccc";
      header.style.backgroundColor = "#f9f9f9";
      header.style.display = "flex";
      header.style.alignItems = "center";
      header.style.justifyContent = "center";
      grid.appendChild(header);
    });

    const rowTitleCell = document.createElement("div");
    rowTitleCell.innerHTML = `<span style="transform: rotateZ(-90deg)">${this.options.rowName}</span>`;
    rowTitleCell.style.gridRowStart = "2"
    rowTitleCell.style.gridRowEnd = `${this.options.rows.length + 3}`
    rowTitleCell.style.color = "#fff";
    this.titleStyling(rowTitleCell, true);
    grid.appendChild(rowTitleCell);
    
    // Adiciona linhas e células da matriz
    this.options.rows.forEach((row, rowIndex) => {
      // Adiciona cabeçalho da linha
      const rowHeader = document.createElement("div");
      rowHeader.textContent = row;
      rowHeader.style.width = `${this.options.cellWidth}px`;
      rowHeader.style.height = `${this.options.cellHeight}px`;
      rowHeader.style.textAlign = "center";
      rowHeader.style.fontWeight = "bold";
      rowHeader.style.fontSize = "12px";
      rowHeader.style.border = "1px solid #ccc";
      rowHeader.style.backgroundColor = "#f9f9f9";
      rowHeader.style.display = "flex";
      rowHeader.style.alignItems = "center";
      rowHeader.style.justifyContent = "center";
      grid.appendChild(rowHeader);

      // Adiciona células da linha
      this.options.cols.forEach((col, colIndex) => {
        const cell = document.createElement("div");
        cell.style.border = "1px solid #ccc";
        cell.style.width = `${this.options.cellWidth}px`;
        cell.style.height = `${this.options.cellHeight}px`;
        cell.style.backgroundColor = this.cellBackgroundColor(rowIndex, colIndex);
        cell.style.display = "flex";
        cell.style.flexWrap = "wrap";
        cell.style.alignItems = "center";
        cell.style.justifyContent = "center";
        cell.style.position = "relative";
        cell.style.overflow = "auto";

        // Adiciona rótulos baseados nos dados
        this.data
          .filter((item) => item.row === row && item.col === col)
          .forEach((item) => {
            const label = document.createElement("span");
            label.textContent = item.label;
            // label.style.position = "absolute";
            label.style.fontSize = "12px";
            label.style.textAlign = "center";
            label.style.padding = "5px";
            label.setAttribute('data-index', item.index);
            cell.appendChild(label);
          });

        grid.appendChild(cell);
      });
    });

    // Adiciona o grid ao contêiner
    this.container.appendChild(grid);
  }

  render() {
    this.createMatrix();
  }

  highlight(index){
    const labels = this.container.querySelectorAll('[data-index]');
    for (let ei = 0; ei < labels.length; ei++) {
      const element = labels.item(ei);
      const eIndex = element.getAttribute('data-index');
      if(eIndex == index || index === -1) element.style.display = 'initial';
      else element.style.display = 'none';
    }
  }
}