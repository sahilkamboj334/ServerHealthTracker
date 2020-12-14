package com.bpm.beans;

import com.bpm.SysUtil;

public class ProcessDetail implements Comparable<ProcessDetail>{
	private String pName;
	private String pType;
	private int activeInstances;
	private double memUsage;
	private String unitType;
	public ProcessDetail(String pName,String pType,int activeInstances,long memUsage) {
		this.pName=pName;
		this.pType=pType;
		this.activeInstances=activeInstances;
			this.memUsage=SysUtil.formatDouble(memUsage/1024.0);
			this.unitType="MB";
	}

	public String getpName() {
		return pName;
	}

	public String getpType() {
		return pType;
	}

	public int getActiveInstances() {
		return activeInstances;
	}

	public double getMemUsage() {
		return memUsage;
	}

	@Override
	public int compareTo(ProcessDetail o) {
		return this.memUsage>=o.memUsage?-1:1;
	}

	public String getUnitType() {
		return unitType;
	}
	@Override
	public String toString() {
		return pName+"\t"+pType+"\t"+activeInstances+"\t"+memUsage+" "+unitType+"\n";
	}

}
