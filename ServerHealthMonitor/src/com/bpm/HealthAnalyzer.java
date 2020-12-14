package com.bpm;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.bpm.beans.ProcessDetail;

public class HealthAnalyzer implements Job {

	@Override
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		Logger.info("Checking health");
		int i = 0;
		long timeDur=ConfigFactory.config().trackingTimeInSecs;
		double cpuLoadVal = 0, ramLoadVal = 0, memoryLoadVal = 0;
		while (i < timeDur) {
			cpuLoadVal += SysUtil.cpuLoad();
			ramLoadVal += SysUtil.ramUsagePrecent();
			memoryLoadVal += SysUtil.getFileSystemUsage(ConfigFactory.config().driveToCheck);
			SysUtil.sleep(1);
			i++;
		}
		cpuLoadVal /= timeDur;
		ramLoadVal /= timeDur;
		memoryLoadVal /= timeDur;
		Logger.info("CPU Avg load--> "+
				SysUtil.formatDouble(cpuLoadVal) + " | RAM Avg load--> " + SysUtil.formatDouble(ramLoadVal) + " | Disk Avg Usage--> " + memoryLoadVal);
		
		boolean cpuFlag=cpuLoadVal >= ConfigFactory.config().thresholdConfig.cpu_load_threshold;
		boolean ramFlag=ramLoadVal >= ConfigFactory.config().thresholdConfig.ram_threshold;
		boolean memoryFlag=memoryLoadVal >= ConfigFactory.config().thresholdConfig.disk_usage_threshold;
		
		if (cpuFlag||ramFlag||memoryFlag) {
			StringBuilder sb=new StringBuilder();
			sb.append("<html><head><style>\r\n" + 
					"table {\r\n" + 
					"  font-family: arial, sans-serif;\r\n" + 
					"  border-collapse: collapse;\r\n" + 
					"  width: 100%;\r\n" + 
					"}\r\n" + 
					"\r\n" + 
					"td, th {\r\n" + 
					"  border: 1px solid #dddddd;\r\n" + 
					"  text-align: left;\r\n" + 
					"  padding: 8px;\r\n" + 
					"}\r\n" + 
					"\r\n" + 
					"tr:nth-child(even) {\r\n" + 
					"  background-color: #dddddd;\r\n" + 
					"}\r\n" + 
					"</style><title>System Health Alert!!!</title></head><body>");
			sb.append("<h3 style='color:red;'>System Health Alert!!!<br> Host&nbsp;=&nbsp;"+SysUtil.getHostName()+"<br>IP&nbsp;=&nbsp;"+SysUtil.ip()+"</h3><br>");
			sb.append("<table><tr><th>CPU Avg Usage %&nbsp;&nbsp;|&nbsp;&nbsp;Threshold Value</th><th>RAM Avg Usage %&nbsp;&nbsp;|&nbsp;&nbsp;Threshold Value</th><th>Disk Avg Usage("+ConfigFactory.config().driveToCheck+") %&nbsp;&nbsp;|&nbsp;&nbsp;Threshold Value&nbsp;&nbsp;</th><th>Used Storage("+ConfigFactory.config().driveToCheck+")&nbsp;&nbsp;|&nbsp;&nbsp;Free Storage("+ConfigFactory.config().driveToCheck+")</th></tr>");
			
			// block for first table containing configured parameter
			
			sb.append("<tr><td>"+getFormattedStr(cpuLoadVal,cpuFlag)+"&nbsp;&nbsp;|&nbsp;&nbsp;"+ConfigFactory.config().thresholdConfig.cpu_load_threshold+"</td>");
			
			sb.append("<td>"+getFormattedStr(ramLoadVal,ramFlag)+"&nbsp;&nbsp;|&nbsp;&nbsp;"+ConfigFactory.config().thresholdConfig.ram_threshold+"</td>");
			
			sb.append("<td>"+getFormattedStr(memoryLoadVal ,memoryFlag)+"&nbsp;&nbsp;|&nbsp;&nbsp;"+ConfigFactory.config().thresholdConfig.disk_usage_threshold+"</td>");
			
			sb.append("<td>"+SysUtil.getUsedStorage(ConfigFactory.config().driveToCheck)+" GB&nbsp;&nbsp;|&nbsp;&nbsp;"+SysUtil.getFreeStorage(ConfigFactory.config().driveToCheck)+" GB</td></table><br><hr>");
			
			// usage per process
			sb.append("<h3 style='color:red;'>Top 25 current processes with CPU Usage</h3><br>");
			sb.append("<table><tr><th>Process Name</th><th>Usage %</th></tr>");
			LinkedList<String> list=SysUtil.perProcessUsageMap();
			for(String str:list) {
				sb.append("<tr>");
				sb.append("<td>"+str.split("~")[0]+"</td>");
				sb.append("<td>"+str.split("~")[1]+"</td>");
				sb.append("</tr>");
			}
			sb.append("</table><br>");
			
			sb.append("<h3 style='color:red;'>Processes Running in System are:-</h3><br>");
			sb.append("<table><tr><th>Process Name</th><th>Process Type</th><th>Active Instances</th><th>Memory Used</th></tr>");
			String processes = SysUtil.executeCommand("cmd /c tasklist.exe");
			List<ProcessDetail> pd=sortAndArrange(processes);
			for(ProcessDetail obj:pd) {
				sb.append("<tr>");
				sb.append("<td>"+obj.getpName()+"</td>");
				sb.append("<td>"+obj.getpType()+"</td>");
				sb.append("<td>"+obj.getActiveInstances()+"</td>");
				sb.append("<td>"+obj.getMemUsage()+" MB"+"</td>");
				sb.append("</tr>");
			}
			
			
			sb.append("</table><br><p style='color:red;'>Generation Time--"+new Date().toString()+"</p><br></body></html>");
			if(ConfigFactory.config().writeOutputFile) {
				Logger.info("Writing output html file to the path --->> "+ConfigFactory.config().outputFilePath);
				SysUtil.writeStringToFile(sb.toString(), ConfigFactory.config().outputFilePath, "System Report");
			}
			if(ConfigFactory.config().triggerEmail) {
				Logger.info("Triggering email to/cc --->> "+SysUtil.commaSeperatedStringToList(ConfigFactory.config().mailTo)+" | CC--> "+SysUtil.commaSeperatedStringToList(ConfigFactory.config().cc));
				MailClient.sendEmail(sb.toString(),
						SysUtil.commaSeperatedStringToList(ConfigFactory.config().mailTo), 
						SysUtil.commaSeperatedStringToList(ConfigFactory.config().cc), 
						ConfigFactory.config().smtpConfig.get("host"), 
						ConfigFactory.config().smtpConfig.get("from"), 
						"System Health Alert!!!  - Host "+SysUtil.getHostName());
			}
				
				
		
		}

	}
	private String getFormattedStr(double value,boolean flag) {
		if(flag) {
			return "<span style='color:red';>&#9888;</span> <b style='color:red';>"+SysUtil.formatDouble(value)+"</b>";
		}
		else {
			return "<b style='color:green';>"+SysUtil.formatDouble(value)+"</b>";
		}
	}
	
	private List<ProcessDetail> sortAndArrange(String processes) {
		List<ProcessDetail> list=new ArrayList<>();
		String[] str=processes.split("\n");
		for(int i=4;i<str.length;i++) {
			String temp[]=str[i].split("\\s+");
			if(temp.length==6) {
				 list.add(new ProcessDetail(temp[0], temp[2], Integer.valueOf(temp[3]), Long.valueOf(temp[4].replaceAll(",", ""))));
			}
			else {
				int val=temp.length-6;
				list.add(new ProcessDetail(temp[0]+temp[val], temp[2+val], Integer.valueOf(temp[3+val]),
						Long.valueOf(temp[4+val].replaceAll(",", ""))));
			}

		}
		Collections.sort(list);
		return list;
	}

}
