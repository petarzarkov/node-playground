import { fork } from "child_process";
import os from "os";
import { writeFileSync } from "fs";

const shutdownAfter = 10000;
const stats = {
    counter: 0,
    cpuAverages: []
};
const handleMessage = (message, sendHandle) => {
    stats.counter += 1;
}
const forksPerCpu = 2;
const CPUs = os.cpus();

const children = [];
for (const cpu of CPUs) {
    console.log("Starting a fork process for", { cpu: JSON.stringify(cpu) })
    // fork per cpu
    for (let i = 0; i < forksPerCpu; i++) {
        const child = fork("./fire.mjs", [100]);
        child.on("message", handleMessage);
        child.on("exit", (code, signal) => {
            console.log("Child exited", JSON.stringify({ code, signal }));
        });
        children.push(child);
    }

}

const startTime = Date.now();
const elapsed = () => Date.now() - startTime;
const shutdown = (signal) => {
    console.log(`Received ${signal} signal`);
    console.log("Waiting 2 seconds and exiting");
    for (const child of children) {
        child.kill();
    }

    const elps = elapsed();
    const result = {
        totalSent: stats.counter,
        sentPerSec: (stats.counter / elps) * 1000,
        elapsed: elps,
        cpuLength: CPUs.length,
        forksPerCpu,
        perFork: stats.counter / children.length,
        totalMemory: `${os.totalmem() / (1024 * 1000)}mb`
    };
    writeFileSync(`${new Date().toISOString().replace(/:/g, "-")}.json`, JSON.stringify({
        ...result,
        cpuAvgs: stats.cpuAverages,
        resourceUsage: process.resourceUsage()
    }, null, 2));
    console.log("Result", JSON.stringify(result));
    setTimeout(() => {
        process.exit(0);
    }, 2000).unref();
};

setTimeout(() => {
    shutdown("Forced")
}, shutdownAfter);

setInterval(() => {
    const elps = elapsed();
    console.log("Elapsed", elps);
    stats.cpuAverages.push({
        [`${elps}ms`]: {
            freemem: `${os.freemem() / (1024 * 1000)} mb`,
            cpuAvg: avgCpuLoad()
        }
    });
}, 1000);

const avgCpuLoad = () => {
    const cpuInfo = os.cpus();
    return cpuInfo.reduce((total, cpu) => total + cpu.times.user + cpu.times.sys + cpu.times.nice + cpu.times.irq, 0) / cpuInfo.length
}

process
    .on("SIGTERM", shutdown)
    .on("SIGINT", shutdown);