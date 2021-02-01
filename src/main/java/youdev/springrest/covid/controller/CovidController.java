package youdev.springrest.covid.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonParseException;

import lombok.extern.slf4j.Slf4j;
import youdev.springrest.covid.service.DataServiceImpl;

@Slf4j
@RestController
@RequestMapping("/api")
public class CovidController {

	@Autowired
	private DataServiceImpl service;

	@GetMapping(value = {"", "/hospitals"}, produces = MediaType.APPLICATION_JSON_VALUE)
	public String findAll(Model model) throws JsonParseException, IOException {
		log.info("/api/hospitals call get hospitals data");
		String json = service.getLastData();
		return json;
	}

}
