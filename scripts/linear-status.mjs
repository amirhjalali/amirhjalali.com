import https from 'https';
const apiKey = process.env.LINEAR_PERSONAL_API_KEY;
const [issueId, stateId] = process.argv.slice(2);
const states = {
  'progress': '07b12a78-c558-4048-b8b6-5a551a3dcfaa',
  'done': 'da8b3c46-1d4e-4eef-8791-75d31ace4a48'
};
const sid = states[stateId] || stateId;
const body = JSON.stringify({query: `mutation { issueUpdate(id: "${issueId}", input: { stateId: "${sid}" }) { success issue { identifier state { name } } } }`});
const req = https.request({hostname:'api.linear.app',path:'/graphql',method:'POST',headers:{'Content-Type':'application/json','Authorization':apiKey,'Content-Length':Buffer.byteLength(body)}}, res => {
  let d=''; res.on('data',c=>d+=c);
  res.on('end',()=>{
    const r=JSON.parse(d);
    if(r.data?.issueUpdate?.success) console.log(r.data.issueUpdate.issue.identifier+' → '+r.data.issueUpdate.issue.state.name);
    else console.log('FAILED',JSON.stringify(r));
  });
}); req.write(body); req.end();
