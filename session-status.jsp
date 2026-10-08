<%@ page language="java" contentType="application/json; charset=UTF-8" trimDirectiveWhitespaces="true" %>
<%
    response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    response.setHeader("Pragma", "no-cache");
    boolean loggedIn = session.getAttribute("phone") != null;
%>{"loggedIn":<%= loggedIn %>}