package com.bpm;

import java.util.Date;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

@DisallowConcurrentExecution
public strictfp class StatusReport implements Job{

	@Override
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		
		Logger.info("Sending status report of the server.....");
		try {
		int i = 0;
		double cpuLoadVal = 0, ramLoadVal = 0, memoryLoadVal = 0;
		while (i < 8) {
			cpuLoadVal += SysUtil.cpuLoad();
			ramLoadVal += SysUtil.ramUsagePrecent();
			memoryLoadVal += SysUtil.getFileSystemUsage(ConfigFactory.config().driveToCheck);
			i++;
			SysUtil.sleep(1);
		}
		cpuLoadVal /= 8;
		ramLoadVal /= 8;
		memoryLoadVal /= 8;
		Logger.info("Status Report---->>>CPU Avg load--> "+
				SysUtil.formatDouble(cpuLoadVal) + " | RAM Avg load--> " + SysUtil.formatDouble(ramLoadVal) + " | Disk Avg Usage--> " + memoryLoadVal);
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
				"</style><title>Production Server Monitoring Status</title></head><body>");
		sb.append("<h3 style='color:green;'>Production Server Monitoring Status<br> Host&nbsp;=&nbsp;"+SysUtil.getHostName()+"<br>IP&nbsp;=&nbsp;"+SysUtil.ip()+"</h3><br>");
		sb.append("<table><tr><th>CPU Avg Usage %&nbsp;&nbsp;|&nbsp;&nbsp;Threshold Value</th><th>RAM Avg Usage %&nbsp;&nbsp;|&nbsp;&nbsp;Threshold Value</th><th>Disk Avg Usage("+ConfigFactory.config().driveToCheck+") %&nbsp;&nbsp;|&nbsp;&nbsp;Threshold Value&nbsp;&nbsp;</th><th>Used Storage("+ConfigFactory.config().driveToCheck+")&nbsp;&nbsp;|&nbsp;&nbsp;Free Storage("+ConfigFactory.config().driveToCheck+")</th></tr>");
		
		// block for first table containing configured parameter
		
		sb.append("<tr><td>"+SysUtil.formatDouble(cpuLoadVal)+"&nbsp;&nbsp;|&nbsp;&nbsp;"+ConfigFactory.config().thresholdConfig.cpu_load_threshold+"</td>");
		
		sb.append("<td>"+SysUtil.formatDouble(ramLoadVal)+"&nbsp;&nbsp;|&nbsp;&nbsp;"+ConfigFactory.config().thresholdConfig.ram_threshold+"</td>");
		
		sb.append("<td>"+SysUtil.formatDouble(memoryLoadVal)+"&nbsp;&nbsp;|&nbsp;&nbsp;"+ConfigFactory.config().thresholdConfig.disk_usage_threshold+"</td>");
		
		sb.append("<td>"+SysUtil.getUsedStorage(ConfigFactory.config().driveToCheck)+" GB&nbsp;&nbsp;|&nbsp;&nbsp;"+SysUtil.getFreeStorage(ConfigFactory.config().driveToCheck)+" GB</td></tr></table><br><hr>");
		
		sb.append("</table><br><p style='color:red;'>Generation Time--"+new Date().toString()+"</p><br></body></html>");
		Logger.info("Triggering email to/cc --->> "+SysUtil.commaSeperatedStringToList(ConfigFactory.config().mailTo)+" | CC--> "+SysUtil.commaSeperatedStringToList(ConfigFactory.config().cc));
		MailClient.sendEmail(sb.toString(),
					SysUtil.commaSeperatedStringToList(ConfigFactory.config().mailTo), 
					SysUtil.commaSeperatedStringToList(ConfigFactory.config().cc), 
					ConfigFactory.config().smtpConfig.get("host"), 
					ConfigFactory.config().smtpConfig.get("from"), 
					"Production Server Monitoring Status  - Host "+SysUtil.getHostName());
		}catch(Exception e) {
			e.printStackTrace();
			JobExecutionException exception=new JobExecutionException(e);
			exception.refireImmediately();
			Logger.info("refiring again.....");
		}

	}

	

}
