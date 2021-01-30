package youdev.springrest.covid.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonParseException;

import youdev.springrest.covid.service.DataServiceImpl;

@RestController
@RequestMapping("/")
public class CovidController {

	@Autowired
	private DataServiceImpl service;

	@RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public String findAll(Model model) throws JsonParseException, IOException {
		String json = service.getLastData();
		return json;
	}

}
