const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const convertConnectionDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
convertConnectionDatabase();

app.get("/states/", async (request, response) => {
  const getStateQuery = `
    SELECT
      *
    FROM
      state;`;
  const responseArray = await db.all(getStateQuery);
  let objectArray = [];
  for (let eachObject of responseArray) {
    objectArray.push({
      stateId: eachObject.state_id,
      stateName: eachObject.state_name,
      population: eachObject.population,
    });
  }
  response.send(objectArray);
});
module.exports = app;



app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT
      *
    FROM
      state
    WHERE 
       state_id= ${stateId};`;
  const responseArray = await db.get(getStateQuery);
  const responseObject = {
    stateId: responseArray.state_id,
    stateName: responseArray.state_name,
    population: responseArray.population,
  };
  response.send(responseObject);
});


app.post("/districts/", async (request, response) => {
  const districtsBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = districtsBody;
  const districtsData = `
    INSERT INTO
      district(district_name,state_id,cases,cured,active,deaths)
    VALUES
      (
        '${districtName}',
        '${stateId}',
        '${cases}',
        '${cured}',
        '${active}',
        '${deaths}'
      );`;
  const responseData = await db.run(districtsData);
  const district_Id = responseData.lastID;
  response.send("District Successfully Added");
});


app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictsQuery = `
    SELECT
      *
    FROM
      district
    WHERE 
       district_id= ${districtId};`;
  const responseArray = await db.get(getDistrictsQuery);
  const objectArray = {
    districtId: responseArray.district_id,
    districtName: responseArray.district_name,
    stateId: responseArray.state_id,
    cases: responseArray.cases,
    cured: responseArray.cured,
    active: responseArray.active,
    deaths: responseArray.deaths,
  };
  response.send(objectArray);
});





app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictsQuery = `
    DELETE FROM
      district
    WHERE 
       district_id= ${districtId};`;
  const responseArray = await db.run(deleteDistrictsQuery);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtsBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = districtsBody;
  const putData = `UPDATE 
      district
    SET 
      district_name='${districtName}',
      state_id='${stateId}',
      cases='${cases}',
      cured='${cured}',
      active='${active}',
      deaths='${deaths}'
      WHERE 
      district_id=${districtId};
    `
    ;
  const responseArray = await db.run(putData);
  response.send("District Details Updated");
});

app.get('/states/:stateId/stats/',async(request,response)=>{
    const {stateId} = request.params 
    const stateData=`
     SELECT
       *
     FROM district
     WHERE state_id=${stateId}
    ` 
    const responseData=await db.all(stateData)
    let total={
        totalCases: 0,
        totalCured: 0,
        totalActive: 0,
        totalDeaths: 0
    }
    for (let eachObject of responseData){
        total.totalCases+=eachObject.cases
        total.totalCured+=eachObject.cured
        total.totalActive+=eachObject.active
        total.totalDeaths+=eachObject.deaths
    }
    response.send(total)
        
 })

app.get('/districts/:districtId/details/',async(request,response)=>{
    const {districtId}=request.params 
    const districtData=`
      SELECT 
        state_id
      FROM district
      WHERE  
      district_id=${districtId};`;
  //  const stateId=districtData.state_id  
    const responseData=await db.get(districtData)
    const stateId=responseData.state_id 
    const stateData=`
       SELECT 
        state_name
      FROM state
      WHERE 
      state_id=${stateId}`;
    const responseState=await db.get(stateData)
    const objectName={
        stateName:responseState.state_name
    }
        
    response.send(objectName)
 }) 
