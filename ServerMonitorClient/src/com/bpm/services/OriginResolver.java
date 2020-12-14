package com.bpm.services;

import java.io.IOException;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.ext.Provider;
@Provider
public class OriginResolver implements ContainerResponseFilter{

	@Override
	public void filter(ContainerRequestContext arg0, ContainerResponseContext responseContext) throws IOException {
		responseContext.getHeaders().add(
	            "Access-Control-Allow-Origin", "*");
	          responseContext.getHeaders().add(
	            "Access-Control-Allow-Credentials", "false");
	          responseContext.getHeaders().add(
	           "Access-Control-Allow-Headers",
	           "origin, content-type, accept 	");
	          responseContext.getHeaders().add(
	            "Access-Control-Allow-Methods", 
	            "GET,OPTIONS, HEAD");
	}

}
