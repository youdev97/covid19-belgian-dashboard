package youdev.covid19.dahsboard.controller;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonParseException;

import lombok.extern.slf4j.Slf4j;
import youdev.covid19.dahsboard.service.DataServiceImpl;

@Slf4j
@RestController
@RequestMapping("/api/hospitals")
public class HospitalsDataController {

	@Autowired
	private DataServiceImpl service;

	
	@GetMapping(value = {""})
	public String getHospitalsData() throws JsonParseException, IOException {
		log.info("/api/hospitals call get hospitals data");
		String json = service.getLastData();
		return json;
	}

}
