package com.bpm.beans;

import java.util.HashMap;

public class Configs {
	public String startTime,endTime;
	
	public HashMap<String, String> smtpConfig;
	public String outputFilePath;
	public boolean writeOutputFile;
	public String triggerFrequency;
	public long trackingTimeInSecs;
	public boolean triggerEmail,sendReportOnSOS,sendReportOnEOS;
	public String mailTo;
	public String cc;
	public String driveToCheck;
	public ThresholdConfig thresholdConfig;

}
