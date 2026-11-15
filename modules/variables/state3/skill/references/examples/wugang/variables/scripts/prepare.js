if (run.stage === 'after') return {};
return { rolls: Object.fromEntries(Object.keys(run.state.docket.exhibits).map(id => [id, Math.random()])) };
