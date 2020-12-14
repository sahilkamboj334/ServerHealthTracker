package com.bpm;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import javax.mail.Address;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMessage.RecipientType;

public class MailClient {

	public static void sendEmail(String msgBody, ArrayList<String> mailTo, ArrayList<String> cc, String host,
			String from, String subject) {
		java.util.Properties properties = new Properties();
		properties.put("mail.smtp.host", host);
		Session session = Session.getDefaultInstance(properties);
		MimeMessage message = new MimeMessage(session);
		try {
			message.setContent(msgBody, "text/html");
			message.setSubject(subject);
			message.setFrom(new InternetAddress(from));
			if (mailTo.size() > 0) {
				message.setRecipients(RecipientType.TO, recipients(mailTo));
				if (cc.size() > 0) {
					message.setRecipients(RecipientType.CC, recipients(cc));
				}
				Transport.send(message);
			} else {
				System.out.println("Please check mail config. mailTo is missing!!!");
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	private static Address[] recipients(List<String> emails) throws Exception {
		Address[] addresses = new Address[emails.size()];
		for (int i = 0; i < emails.size(); i++) {
			addresses[i] = new InternetAddress(emails.get(i));
		}
		return addresses;
	}

}
