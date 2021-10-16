package youdev.covid19.dahsboard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
public class IndexController {
	
	/*
	 * Redirect to the ReactJS page
	 */
	@GetMapping(value = {"","/"})
	public String index() {
		log.info("Request to Index Page");
		return "index";
	}
}
