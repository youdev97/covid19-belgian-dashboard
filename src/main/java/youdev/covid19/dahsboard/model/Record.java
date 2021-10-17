package youdev.covid19.dahsboard.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Record {

	@JsonProperty("recordid")
	private String recordId;
	
	@JsonProperty("province")
	private String province;
	
	@JsonProperty("region")
	private String region;
	
	@JsonProperty("new_in")
	private int newIn;
	
	@JsonProperty("new_out")
	private int newOut;
	
	@JsonProperty("total_in")
	private int totalIn;
	
	@JsonProperty("total_in_resp")
	private int totalInResp;
	
	@JsonProperty("date")
	private String date;
	
}
